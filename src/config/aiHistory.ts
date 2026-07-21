export type AiHistoryItem = {
  id: string
  label: string
  kind: 'app' | 'chat'
}

export type AiHistoryGroup = {
  label: string
  items: AiHistoryItem[]
}

export const aiPanelHistory: AiHistoryGroup[] = [
  {
    label: 'Today',
    items: [
      { id: 'skill-bridge-empty', label: 'Skill Bridge enrollment funnel empty', kind: 'app' },
      { id: 'activity-spike', label: 'Activity spike July 20-21 WeLe IntelliTech', kind: 'chat' },
      { id: 'platform-baseline', label: 'Platform baseline week one metrics', kind: 'app' },
    ],
  },
  {
    label: 'Yesterday',
    items: [
      { id: 'onboarding-feedback', label: 'Onboarding feedback summary', kind: 'chat' },
      { id: 'no-feedback-sources', label: 'No feedback sources configured yet', kind: 'chat' },
    ],
  },
]

export const reflexAiHistory: AiHistoryGroup[] = [
  {
    label: 'Today',
    items: [
      { id: 'summarize-trends', label: 'Summarize current trends in this dashboard', kind: 'app' },
      { id: 'activity-spike', label: 'Activity spike July 20-21 WeLe IntelliTech', kind: 'chat' },
      { id: 'platform-baseline', label: 'Platform baseline week one metrics', kind: 'app' },
    ],
  },
  {
    label: 'Yesterday',
    items: [
      { id: 'onboarding-feedback', label: 'Onboarding feedback summary', kind: 'chat' },
      { id: 'no-feedback-sources', label: 'No feedback sources configured yet', kind: 'chat' },
    ],
  },
]
