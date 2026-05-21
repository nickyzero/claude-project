import Link from 'next/link'
import { getTimeSlotLabel, getTimeSlotEmoji } from '@/lib/timeslot'
import type { DiaryEntry } from '@/types/diary'

interface HistoryListProps {
  entries: DiaryEntry[]
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${year}년 ${month}월 ${day}일`
}

export function HistoryList({ entries }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <div className="mb-3 text-4xl opacity-40">📖</div>
        <p className="mb-5 text-sm text-muted-foreground">
          아직 기록이 없어요.
          <br />
          오늘의 하루를 적어보세요.
        </p>
        <Link
          href="/"
          className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          첫 기록 시작하기
        </Link>
      </div>
    )
  }

  const grouped = entries.reduce<Record<string, DiaryEntry[]>>((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = []
    acc[entry.date].push(entry)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => (b > a ? 1 : -1))

  return (
    <div className="p-4">
      {sortedDates.map((date) => (
        <div key={date} className="mb-5">
          <p className="mb-2.5 pl-0.5 text-xs font-semibold text-muted-foreground">
            {formatDate(date)}
          </p>
          {grouped[date].map((entry) => (
            <article
              key={`${entry.date}-${entry.slot}`}
              className="mb-2.5 rounded-xl bg-card p-4 shadow-sm"
            >
              <span className="mb-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                {getTimeSlotEmoji(entry.slot)} {getTimeSlotLabel(entry.slot)}
              </span>
              <p className="mb-2 text-sm leading-snug text-foreground">
                {entry.text}
              </p>
              <p className="flex gap-1 text-xs leading-snug text-muted-foreground">
                <span>💬</span>
                <span>{entry.aiReply}</span>
              </p>
            </article>
          ))}
        </div>
      ))}
    </div>
  )
}
