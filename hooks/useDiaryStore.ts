import type { DiaryEntry, QuoteCache } from '@/types/diary'

const KEY_PREFIX = 'haruHanjul:v1'

function diaryKey(date: string, slot: string) {
  return `${KEY_PREFIX}:diary:${date}:${slot}`
}

function quoteKey(date: string, slot: string) {
  return `${KEY_PREFIX}:quote:${date}:${slot}`
}

export function getDiaryEntry(date: string, slot: string): DiaryEntry | null {
  try {
    const raw = localStorage.getItem(diaryKey(date, slot))
    return raw ? (JSON.parse(raw) as DiaryEntry) : null
  } catch {
    return null
  }
}

export function saveDiaryEntry(
  entry: Omit<DiaryEntry, 'createdAt' | 'updatedAt'>
): DiaryEntry {
  const now = Date.now()
  const full: DiaryEntry = { ...entry, createdAt: now, updatedAt: now }
  try {
    localStorage.setItem(diaryKey(entry.date, entry.slot), JSON.stringify(full))
  } catch {}
  return full
}

export function updateDiaryEntry(
  date: string,
  slot: string,
  updates: Partial<Pick<DiaryEntry, 'text' | 'aiReply'>>
): DiaryEntry | null {
  const existing = getDiaryEntry(date, slot)
  if (!existing) return null
  const updated: DiaryEntry = { ...existing, ...updates, updatedAt: Date.now() }
  try {
    localStorage.setItem(diaryKey(date, slot), JSON.stringify(updated))
  } catch {}
  return updated
}

export function getAllEntries(): DiaryEntry[] {
  const entries: DiaryEntry[] = []
  try {
    const prefix = `${KEY_PREFIX}:diary:`
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) {
        try {
          const raw = localStorage.getItem(key)
          if (raw) entries.push(JSON.parse(raw) as DiaryEntry)
        } catch {}
      }
    }
  } catch {}
  return entries.sort((a, b) => b.createdAt - a.createdAt)
}

export function getQuoteCache(date: string, slot: string): QuoteCache | null {
  try {
    const raw = localStorage.getItem(quoteKey(date, slot))
    return raw ? (JSON.parse(raw) as QuoteCache) : null
  } catch {
    return null
  }
}

export function saveQuoteCache(cache: QuoteCache): void {
  try {
    localStorage.setItem(quoteKey(cache.date, cache.slot), JSON.stringify(cache))
  } catch {}
}
