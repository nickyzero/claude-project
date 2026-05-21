'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTimeSlot } from '@/lib/timeslot'
import { getQuoteCache, saveQuoteCache, getDiaryEntry } from '@/hooks/useDiaryStore'
import { QuoteCard } from './QuoteCard'
import { DawnScreen } from './DawnScreen'
import { DiaryForm } from './DiaryForm'
import { DiaryView } from './DiaryView'
import type { TimeSlot, DiarySlot, DiaryEntry, QuoteCache } from '@/types/diary'

type PageMode = 'create' | 'view' | 'edit'

const FALLBACK_QUOTE: Pick<QuoteCache, 'quoteText' | 'quoteAuthor' | 'backgroundUrl'> = {
  quoteText: '오늘 하루도 특별한 날입니다.',
  quoteAuthor: '하루한줄',
  backgroundUrl: '',
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

export function MainPage() {
  const [slot, setSlot] = useState<TimeSlot | null>(null)
  const [quote, setQuote] = useState<QuoteCache | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [entry, setEntry] = useState<DiaryEntry | null>(null)
  const [mode, setMode] = useState<PageMode>('create')

  useEffect(() => {
    const hour = new Date().getHours()
    const currentSlot = getTimeSlot(hour)
    setSlot(currentSlot)

    if (currentSlot === 'dawn') {
      return
    }

    const today = getTodayDate()

    const existingEntry = getDiaryEntry(today, currentSlot)
    if (existingEntry) {
      setEntry(existingEntry)
      setMode('view')
    }

    const cached = getQuoteCache(today, currentSlot)
    if (cached) {
      setQuote(cached)
      return
    }

    setQuoteLoading(true)
    fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot: currentSlot }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('quote fetch failed')
        return r.json() as Promise<{ quoteText: string; quoteAuthor: string; backgroundUrl: string }>
      })
      .then((data) => {
        const quoteCache: QuoteCache = {
          date: today,
          slot: currentSlot,
          quoteText: data.quoteText,
          quoteAuthor: data.quoteAuthor,
          backgroundUrl: data.backgroundUrl,
          cachedAt: Date.now(),
        }
        saveQuoteCache(quoteCache)
        setQuote(quoteCache)
        setQuoteLoading(false)
      })
      .catch((err) => {
        console.error('Quote fetch error:', err)
        setQuote({ date: today, slot: currentSlot, ...FALLBACK_QUOTE, cachedAt: Date.now() })
        setQuoteLoading(false)
      })
  }, [])

  // slot=null means before hydration — render a dark shell to avoid flash
  if (slot === null) {
    return <div className="min-h-screen bg-slate-800" />
  }

  if (slot === 'dawn') return <DawnScreen />

  const diarySlot = slot as DiarySlot

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-800">
      {quote?.backgroundUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${quote.backgroundUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <nav className="flex items-center justify-between px-5 py-4">
          <span className="text-base font-bold tracking-tight text-white">하루한줄</span>
          <Link
            href="/history"
            className="rounded-full border border-white/40 px-3 py-1 text-sm text-white/80"
          >
            히스토리
          </Link>
        </nav>

        <div className="flex-1" />

        {/* Quote area — always rendered so DiaryForm is not alone */}
        <div className="mx-5 mb-5">
          {quoteLoading ? (
            <div className="rounded-2xl border border-white/25 bg-white/20 p-5">
              <p className="text-sm text-white/60">명언 불러오는 중…</p>
            </div>
          ) : quote ? (
            <QuoteCard slot={slot} quoteText={quote.quoteText} quoteAuthor={quote.quoteAuthor} />
          ) : null}
        </div>

        <div className="mx-4 mb-6">
          {mode === 'view' && entry ? (
            <DiaryView entry={entry} onEdit={() => setMode('edit')} />
          ) : mode === 'edit' && entry ? (
            <DiaryForm
              slot={diarySlot}
              mode="edit"
              initialText={entry.text}
              existingEntry={entry}
              onSave={(saved) => {
                setEntry(saved)
                setMode('view')
              }}
              onCancel={() => setMode('view')}
            />
          ) : (
            <DiaryForm
              slot={diarySlot}
              mode="create"
              onSave={(saved) => {
                setEntry(saved)
                setMode('view')
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
