# Reflex (demo)

Finance operations workspace: receivables, reconciliation, cash-flow forecasting and customer intelligence.
The **Reflex AI** assistant answers questions about the data on those screens with streaming text, tables, charts and KPI strips.

## Run it

```bash
npm install
cp .env.example .env        # then set OPENAI_API_KEY
npm run dev                 # app + AI API on http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server. The AI API (`/api/chat`) is mounted on it by a Vite plugin, so this is the only process you need. |
| `npm run build && npm start` | Production: `server/index.mjs` serves `dist/` and `/api/chat` on `$PORT` (default 8787). |
| `npm run ai:smoke` | End-to-end check of the AI: 19 realistic questions across every in-scope screen, streamed through the real handler. Validates structure (charts / KPIs / follow-ups parse) and prints timings. `-- --print` shows answers, `-- --only workbench` filters, `-- --model gpt-5.4` overrides the model. Costs a few cents. |

## How the AI works

```
 browser (src/)                                server (server/)                        OpenAI
 ──────────────                                ────────────────                       ──────
 AiChatContext ─ messages + workspace data ──► /api/chat ── system prompt + data ───► chat.completions (stream)
 (history, streaming, stop, regenerate)        (key, prompt, validation,               gpt-5.4-mini, low reasoning
        ▲                                       rate limit)                                  │
        └──────────── SSE text deltas ◄──────────────────────────────────────────────────────┘
 RichMessage: Markdown + chart / kpis / followups blocks  ->  tables, SVG charts, KPI tiles, follow-up chips
```

- **The key never reaches the browser.** `OPENAI_API_KEY` is read server-side only (no `VITE_` prefix) and `.env` is git-ignored. The system prompt also lives on the server (`server/prompt.mjs`).
- **Grounded in the screens' own data.** `src/ai/knowledge.ts` serialises every in-scope screen (Home, FinPilot, Forecast Board, Reconciliation Hub Overview and Workbench, Customers, Payments, Customer 360) from the same `src/data/mock*.ts` modules the pages render, labelled by widget. Totals, shares, ranks, FIFO allocations and anomaly flags are **pre-computed**, so the model reads numbers rather than doing arithmetic. When the mock modules are replaced by real APIs, only the imports in that file change.
- **Knows what you are looking at.** Pages publish live state with `useAiPageState('<page id>', { ... })` (selected payment, filters, cards placed on the Forecast Board), so "explain this payment" or "what's committed right now?" resolve against the live screen. Each widget's sparkle button (`AskAiPopover`) scopes the question to that widget.
- **Rich answers.** The model writes Markdown (bold, italics, GFM tables, callouts, internal links) plus fenced `chart`, `kpis` and `followups` JSON blocks. `src/ai/parseBlocks.ts` parses them (safe while streaming) and `src/components/ai/rich/` renders them: column, ranked-bar, line / area (with forecast shading), bubble (risk matrix) and segmented charts. Every chart has a table view, tooltips and keyboard access, and uses the validated palette in `index.css`.
- **Conversations persist** in `localStorage` (`reflex.ai.conversations.v1`) and continue seamlessly between the side panel and the full-page view.

### Configuration

| Variable | Default | Notes |
|---|---|---|
| `OPENAI_API_KEY` | none | Required. Server-side only. |
| `OPENAI_MODEL` | `gpt-5.4-mini` | Chosen by benchmarking the real prompts: correct figures, about 3s per answer, mini-tier cost. `gpt-5.5` is the most polished but about 2x slower and costlier. Avoid the nano models (they skip charts and tables). |
| `OPENAI_REASONING_EFFORT` | `low` | For `gpt-5*` and `o*` models. |
| `PORT` | `8787` | Production server only. |

### Extending it

- **New screen or data**: add a section to `src/ai/knowledge.ts`, an entry in `src/ai/pages.ts` (description and suggested prompts), and call `useAiPageState` in the page.
- **Tone, rules, or which visuals the model may use**: edit `server/prompt.mjs`, then run `npm run ai:smoke`.

## Currency symbol (Settings > Currency)

A demo-only switch: choose **Default, INR (₹), USD ($) or CAD (CA$)** and press **Apply**. Nothing is converted. Every number stays exactly as it is and only the currency symbol (and a written code such as "(USD)") changes, on every screen, chart, tooltip and in the Reflex AI answers. Default leaves each screen as recorded.

It is one small mechanism rather than per-screen code: `src/features/currency/symbol.ts` holds the choice (remembered in `localStorage`, shared across open windows) and the `relabel()` rule, and `domRelabel.ts` applies it to everything on screen (and to anything React renders later) while remembering each original, so Default restores the page exactly. The assistant is told the chosen symbol in its CURRENT VIEW message. Anything inside `data-currency-skip` is left alone (the Settings card shows the symbols themselves). The rule only sees symbols written next to an amount ("$128,450", "₹4.82 Cr", "SGD 8,630", "(₹)") or as a bare code, so new screens work with no extra code as long as amounts are written that way.

### Deploying (Render)

`render.yaml` defines a **Node web service** (a static site cannot hold the key). Set `OPENAI_API_KEY` in the Render dashboard. `/api/chat` is public once deployed: it is size-limited and rate-limited per client (24 requests per minute) and the model output is capped, but put it behind authentication before sharing the URL widely.

---

## Template notes (React + TypeScript + Vite)

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
