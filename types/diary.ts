export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'dawn'

export interface DiaryEntry {
  date: string
  slot: 'morning' | 'afternoon' | 'evening'
  text: string
  aiReply: string
  createdAt: number
  updatedAt: number
}

export interface QuoteCache {
  date: string
  slot: TimeSlot
  quoteText: string
  quoteAuthor: string
  backgroundUrl: string
  cachedAt: number
}
