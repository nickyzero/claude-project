'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllEntries } from '@/hooks/useDiaryStore'
import { HistoryList } from '@/components/daily-quote-diary/HistoryList'
import type { DiaryEntry } from '@/types/diary'

export default function HistoryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])

  useEffect(() => {
    setEntries(getAllEntries())
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex items-center gap-3 border-b border-border bg-background px-5 py-4">
        <Link
          href="/"
          className="rounded-md border border-border bg-background px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← 돌아가기
        </Link>
        <h1 className="text-base font-bold text-foreground">나의 기록</h1>
      </header>
      <HistoryList entries={entries} />
    </div>
  )
}
