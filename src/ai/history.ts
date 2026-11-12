import type { AiConversation } from './types'

export type ConversationGroup = { label: string; items: AiConversation[] }

const startOfDay = (time: number) => {
  const date = new Date(time)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

/** Today / Yesterday / Previous 7 days / Earlier, newest first. */
export function groupConversations(conversations: AiConversation[], now = Date.now()): ConversationGroup[] {
  const today = startOfDay(now)
  const day = 24 * 60 * 60 * 1000
  const buckets: ConversationGroup[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Previous 7 days', items: [] },
    { label: 'Earlier', items: [] },
  ]

  for (const conversation of [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)) {
    const age = today - startOfDay(conversation.updatedAt)
    const index = age <= 0 ? 0 : age <= day ? 1 : age <= 7 * day ? 2 : 3
    buckets[index].items.push(conversation)
  }
  return buckets.filter((bucket) => bucket.items.length > 0)
}
