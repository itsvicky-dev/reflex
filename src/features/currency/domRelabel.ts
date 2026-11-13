import { relabel, relabelBareSymbol, type SymbolChoice } from './symbol'

/**
 * Applies the chosen currency symbol to everything on screen: page text, SVG chart labels, tooltips, the assistant's
 * answers, and the `title` / `aria-label` attributes.
 *
 * It rewrites text in place, remembers each piece of text's original so "Default" restores it exactly, and keeps
 * watching so anything React renders later (a hovered tooltip, a streamed answer, the next page) is relabelled too.
 * It does nothing at all while the choice is "Default". Anything inside `[data-currency-skip]` is left alone (the
 * Settings card shows the symbols themselves).
 */

type Tracked = { original: string; applied: string }

const SKIP = '[data-currency-skip]'
const SKIP_TAGS = 'script,style,textarea,noscript'
const ATTRIBUTES = ['title', 'aria-label']

const textState = new WeakMap<Text, Tracked>()
const attributeState = new WeakMap<Element, Map<string, Tracked>>()

let current: SymbolChoice = 'ORIGINAL'
let observer: MutationObserver | null = null

function processText(node: Text) {
  const parent = node.parentElement
  if (!parent || parent.closest(SKIP) || parent.closest(SKIP_TAGS)) return

  const tracked = textState.get(node)
  // If the text is what we wrote, start again from the original; if React wrote something new, that is the new original.
  const original = tracked && node.data === tracked.applied ? tracked.original : node.data

  const next = node.nextSibling
  const nextText = next?.nodeType === Node.TEXT_NODE ? (next as Text).data : ''
  let target = relabelBareSymbol(original, nextText, current)
  if (target === original) target = relabel(original, current)

  if (tracked || target !== original) textState.set(node, { original, applied: target })
  if (node.data !== target) node.data = target
}

function processAttribute(element: Element, name: string) {
  if (element.closest(SKIP)) return
  const value = element.getAttribute(name)
  if (value === null) return

  const states = attributeState.get(element) ?? new Map<string, Tracked>()
  const tracked = states.get(name)
  const original = tracked && value === tracked.applied ? tracked.original : value
  const target = relabel(original, current)

  if (tracked || target !== original) {
    states.set(name, { original, applied: target })
    attributeState.set(element, states)
  }
  if (value !== target) element.setAttribute(name, target)
}

function processTree(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    processText(root as Text)
    return
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return
  const element = root as Element
  if (element.closest(SKIP)) return

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  const texts: Text[] = []
  for (let node = walker.nextNode(); node; node = walker.nextNode()) texts.push(node as Text)
  texts.forEach(processText)

  const withAttributes = [element, ...element.querySelectorAll('[title],[aria-label]')]
  for (const target of withAttributes) for (const name of ATTRIBUTES) if (target.hasAttribute(name)) processAttribute(target, name)
}

function onMutations(records: MutationRecord[]) {
  for (const record of records) {
    if (record.type === 'characterData') processText(record.target as Text)
    else if (record.type === 'attributes') processAttribute(record.target as Element, record.attributeName as string)
    else record.addedNodes.forEach(processTree)
  }
}

/** Shows every amount with the chosen symbol (or restores the original text for "Default"). Safe to call repeatedly. */
export function applyCurrencySymbol(choice: SymbolChoice) {
  if (typeof document === 'undefined') return
  current = choice
  observer?.disconnect()

  // Our own edits happen while the observer is disconnected, so they never come back as new mutations.
  processTree(document.body)

  if (choice === 'ORIGINAL') return
  observer ??= new MutationObserver(onMutations)
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRIBUTES,
  })
}
