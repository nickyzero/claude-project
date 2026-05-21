import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getDiaryEntry,
  saveDiaryEntry,
  updateDiaryEntry,
  getAllEntries,
  getQuoteCache,
  saveQuoteCache,
} from './useDiaryStore'

describe('useDiaryStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('saves and retrieves a diary entry with same text', () => {
    saveDiaryEntry({ date: '2026-01-01', slot: 'morning', text: '테스트', aiReply: '답글' })
    const result = getDiaryEntry('2026-01-01', 'morning')
    expect(result?.text).toBe('테스트')
  })

  it('updateDiaryEntry changes text and bumps updatedAt', () => {
    saveDiaryEntry({ date: '2026-01-01', slot: 'morning', text: '원본', aiReply: '답글' })
    const before = getDiaryEntry('2026-01-01', 'morning')!
    updateDiaryEntry('2026-01-01', 'morning', { text: '수정본' })
    const after = getDiaryEntry('2026-01-01', 'morning')!
    expect(after.text).toBe('수정본')
    expect(after.updatedAt).toBeGreaterThanOrEqual(before.updatedAt)
  })

  it('getAllEntries returns all entries sorted by createdAt descending', () => {
    saveDiaryEntry({ date: '2026-01-01', slot: 'morning', text: 'a', aiReply: 'r' })
    saveDiaryEntry({ date: '2026-01-02', slot: 'afternoon', text: 'b', aiReply: 'r' })
    const entries = getAllEntries()
    expect(entries).toHaveLength(2)
    expect(entries[0].createdAt).toBeGreaterThanOrEqual(entries[1].createdAt)
  })

  it('saveQuoteCache and getQuoteCache round-trips quoteText', () => {
    saveQuoteCache({
      date: '2026-01-01',
      slot: 'morning',
      quoteText: '명언 텍스트',
      quoteAuthor: '저자',
      backgroundUrl: 'https://example.com/img.jpg',
      cachedAt: Date.now(),
    })
    const result = getQuoteCache('2026-01-01', 'morning')
    expect(result?.quoteText).toBe('명언 텍스트')
  })

  it('getDiaryEntry returns null and does not throw when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    expect(() => getDiaryEntry('2026-01-01', 'morning')).not.toThrow()
    expect(getDiaryEntry('2026-01-01', 'morning')).toBeNull()
  })
})
