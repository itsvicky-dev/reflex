/**
 * Loads the app's real TypeScript AI modules in Node by way of Vite's SSR loader, so scripts exercise exactly
 * the data and parsing the browser uses.
 */
import { createServer } from 'vite'

export async function loadAppModules() {
  const vite = await createServer({
    configFile: false,
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom',
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true },
  })
  try {
    const knowledge = await vite.ssrLoadModule('/src/ai/knowledge.ts')
    const pages = await vite.ssrLoadModule('/src/ai/pages.ts')
    const parse = await vite.ssrLoadModule('/src/ai/parseBlocks.ts')
    return {
      knowledge: knowledge.buildKnowledge(),
      describeCustomer: knowledge.describeCustomer,
      resolveAiPage: pages.resolveAiPage,
      parseRichContent: parse.parseRichContent,
    }
  } finally {
    await vite.close()
  }
}
