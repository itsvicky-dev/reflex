/**
 * End-to-end smoke test for Reflex AI.
 *
 * Boots the real chat handler on an ephemeral port, streams realistic questions for every in-scope screen
 * through it (using the real workspace data), and checks that each answer is non-empty, streams, and that all
 * rich blocks (charts, KPI strips, follow-ups) parse. Costs a few cents per run.
 *
 *   npm run ai:smoke                          all cases
 *   npm run ai:smoke -- --only workbench      cases whose id contains "workbench"
 *   npm run ai:smoke -- --model gpt-5.5       override OPENAI_MODEL
 *   npm run ai:smoke -- --print               print every answer in full
 */

import { createServer } from 'node:http'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createChatHandler } from '../server/chat.mjs'
import { loadAppModules } from './load-knowledge.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
try {
  process.loadEnvFile(join(root, '.env'))
} catch {
  // rely on the real environment
}

const args = process.argv.slice(2)
const flag = (name) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? null : (args[index + 1] ?? true)
}
const model = typeof flag('model') === 'string' ? flag('model') : process.env.OPENAI_MODEL
const effort = typeof flag('effort') === 'string' ? flag('effort') : process.env.OPENAI_REASONING_EFFORT
const only = typeof flag('only') === 'string' ? flag('only') : null
const print = args.includes('--print')

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set (add it to .env).')
  process.exit(1)
}

const CASES = [
  { id: 'home-summary', page: '/home', q: 'Give me an executive summary of our receivables position', must: [/128,450/] },
  { id: 'home-ageing-chart', page: '/home', q: 'Chart outstanding by ageing bucket and flag the risk', expect: { chart: true }, must: [/60,050/, /46\.7/] },
  { id: 'home-recon-week', page: '/home', q: 'How is AI reconciliation performing this week?', expect: { visual: true } },
  { id: 'finpilot-cash', page: '/finance-navigator', q: 'Forecast cash inflow for the next 7 days and call out the peak', expect: { chart: true }, must: [/2\.48/, /8\.73/, /18 May/] },
  { id: 'finpilot-revenue', page: '/finance-navigator', q: 'Explain the revenue decline and its root causes', expect: { visual: true } },
  { id: 'finpilot-risk', page: '/finance-navigator', q: 'Which customers are in the critical risk zone?' },
  { id: 'board-prob', page: '/control-tower', q: "Summarise next week's receivables by payment probability", expect: { visual: true } },
  { id: 'board-live', page: '/control-tower', q: 'What is committed vs doubtful right now?', must: [/1\.00/, /0\.29/], live: { aiSuggestion: false, placements: { committed: ['ABC Industries INV-10234 $0.62', 'XYZ Corp INV-10241 $0.38'], probable: [], possible: [], doubtful: ['Om Enterprises INV-10270 $0.29'] }, unplaced: 5 } },
  { id: 'hub-review', page: '/reconciliation-hub/overview', q: 'Which transactions need review and why?', expect: { visual: true } },
  {
    id: 'workbench-selected',
    page: '/reconciliation-hub/workbench',
    q: 'Explain the suggested allocation for the selected payment',
    must: [/BT-7847/, /840/, /940/],
    live: { selectedPayment: 'BT-7847', allocationMode: 'ai (FIFO)', search: '' },
  },
  { id: 'workbench-risky', page: '/reconciliation-hub/workbench', q: 'Which payments look risky to auto-match?', expect: { visual: true } },
  { id: 'customers-manager', page: '/customer-intelligence/customers', q: 'Which account manager has the riskiest portfolio?', expect: { visual: true }, must: [/Karthik/, /67\.5/] },
  { id: 'customers-rank', page: '/customer-intelligence/customers', q: 'Rank customers by health score and show who is critical', expect: { visual: true } },
  { id: 'payments-chase', page: '/customer-intelligence/payments', q: 'Who should we chase first, and why?', expect: { visual: true }, must: [/Chop Chop/, /8,?130/] },
  { id: 'payments-ageing', page: '/customer-intelligence/payments', q: 'Chart the ageing profile across all customers', expect: { chart: true } },
  { id: 'draft-email', page: '/customer-intelligence/customers', q: 'Draft a polite payment reminder to Nasi Kandar House', must: [/Nasi Kandar/, /1,?380/, /\[Your name\]/] },
  { id: 'customer-detail', page: '/customer-intelligence/overview/golden-wok', q: 'Summarise this customer’s payment risk', must: [/Golden Wok/, /78/] },
  { id: 'out-of-scope', page: '/home', q: 'Write me a poem about the ocean' },
  { id: 'not-in-data', page: '/customer-intelligence/customers', q: "What was Golden Wok's DSO last year?", must: [/not (available|provided|in)|doesn[’']t|does not|isn[’']t|no .{0,40}DSO/i] },
]

const cases = only ? CASES.filter((c) => c.id.includes(only)) : CASES

const { knowledge, describeCustomer, resolveAiPage, parseRichContent } = await loadAppModules()

const handler = createChatHandler({ apiKey: process.env.OPENAI_API_KEY, model, reasoningEffort: effort })
const server = createServer((req, res) => handler(req, res))
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`

function viewFor(testCase) {
  const page = resolveAiPage(testCase.page)
  const lines = [`Screen: ${page.title} (route ${testCase.page})`, `What is on screen: ${page.description}`]
  const customerMatch = testCase.page.match(/overview\/([^/]+)/)
  if (customerMatch) lines.push(describeCustomer(customerMatch[1]) ?? '')
  if (testCase.live) lines.push(`LIVE STATE (what the user currently has selected / filtered / placed on this screen):\n${JSON.stringify(testCase.live, null, 1)}`)
  return lines.join('\n')
}

async function ask(testCase) {
  const started = performance.now()
  const response = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: testCase.q }], context: { knowledge, view: viewFor(testCase) } }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`)

  let text = ''
  let firstToken = null
  let usage = null
  let buffer = ''
  const decoder = new TextDecoder()
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true })
    let boundary
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      for (const line of raw.split('\n')) {
        if (!line.startsWith('data:')) continue
        const event = JSON.parse(line.slice(5))
        if (event.t === 'delta') {
          firstToken ??= performance.now() - started
          text += event.v
        } else if (event.t === 'error') throw new Error(event.message)
        else if (event.t === 'done') usage = event.usage
      }
    }
  }
  return { text, ttft: firstToken, total: performance.now() - started, usage }
}

function check(testCase, text) {
  const problems = []
  const segments = parseRichContent(text, false)
  const charts = segments.filter((s) => s.kind === 'chart')
  const followups = segments.find((s) => s.kind === 'followups')
  const hasTable = /^\|.+\|\s*$/m.test(text.replace(/```[\s\S]*?```/g, ''))
  const strayFence = [...text.matchAll(/^```\s*([a-z]*)\s*$/gim)].map((m) => m[1].toLowerCase()).filter((lang) => lang && !['chart', 'kpis', 'followups'].includes(lang))
  const kpis = segments.filter((s) => s.kind === 'kpis')

  if (text.trim().length < 40) problems.push('answer too short')
  if (strayFence.length) problems.push(`unsupported code fence: ${strayFence.join(', ')}`)
  for (const chart of charts) if (!chart.spec) problems.push('a chart block failed to parse/validate')
  for (const k of kpis) if (k.items.length === 0) problems.push('a kpis block failed to parse')
  if (!followups || followups.items.length < 2) problems.push('missing follow-ups')
  if (testCase.expect?.chart && !charts.some((c) => c.spec)) problems.push('expected a chart')
  if (testCase.expect?.visual && !charts.some((c) => c.spec) && !hasTable && kpis.length === 0) problems.push('expected a table, chart or KPI strip')
  if (/[\u{1F300}-\u{1FAFF}]/u.test(text)) problems.push('contains emoji')
  for (const pattern of testCase.must ?? []) if (!pattern.test(text)) problems.push(`answer is missing expected fact ${pattern}`)
  return { problems, charts: charts.length, tables: hasTable ? 1 : 0, kpis: kpis.length, followups: followups?.items.length ?? 0 }
}

console.log(`Model: ${model ?? '(server default)'}  |  knowledge ≈ ${Math.round(knowledge.length / 3.6)} tokens  |  ${cases.length} case(s)\n`)

let failed = 0
const timings = []
for (const testCase of cases) {
  try {
    const result = await ask(testCase)
    const verdict = check(testCase, result.text)
    timings.push(result)
    const ok = verdict.problems.length === 0
    if (!ok) failed++
    const words = result.text.split(/\s+/).length
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${testCase.id.padEnd(20)} first token ${(result.ttft / 1000).toFixed(1)}s  total ${(result.total / 1000).toFixed(1)}s  ${words}w  charts=${verdict.charts} tables=${verdict.tables} kpis=${verdict.kpis} followups=${verdict.followups}` +
        (result.usage ? `  tokens in/out/cached ${result.usage.prompt}/${result.usage.completion}/${result.usage.cached}` : ''),
    )
    for (const problem of verdict.problems) console.log(`      - ${problem}`)
    if (print) console.log(`\n--- Q: ${testCase.q}\n${result.text}\n`)
  } catch (error) {
    failed++
    console.log(`FAIL  ${testCase.id.padEnd(20)} ${error.message}`)
  }
}

if (timings.length) {
  const avg = (key) => timings.reduce((a, t) => a + t[key], 0) / timings.length / 1000
  console.log(`\nAverage first token ${avg('ttft').toFixed(1)}s, average total ${avg('total').toFixed(1)}s`)
}
server.close()
console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} case(s) need attention.`)
process.exit(failed === 0 ? 0 : 1)
