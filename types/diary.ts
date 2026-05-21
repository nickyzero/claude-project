export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'dawn'
export type DiarySlot = 'morning' | 'afternoon' | 'evening'

export const DIARY_SLOTS: readonly DiarySlot[] = ['morning', 'afternoon', 'evening']

export interface DiaryEntry {
  date: string
  slot: DiarySlot
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
