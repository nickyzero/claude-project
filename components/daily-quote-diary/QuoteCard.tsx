import { getTimeSlotLabel, getTimeSlotRange, getTimeSlotEmoji } from '@/lib/timeslot'
import type { TimeSlot } from '@/types/diary'

interface QuoteCardProps {
  slot: TimeSlot
  quoteText: string
  quoteAuthor: string
}

export function QuoteCard({ slot, quoteText, quoteAuthor }: QuoteCardProps) {
  return (
    <div className="mx-5 mb-5 rounded-2xl border border-white/25 bg-white/15 p-5 backdrop-blur-md">
      <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white/90">
        {getTimeSlotEmoji(slot)} {getTimeSlotLabel(slot)} · {getTimeSlotRange(slot)}
      </span>
      <p className="mb-2.5 text-sm leading-relaxed text-white">{quoteText}</p>
      <p className="text-right text-xs text-white/65">— {quoteAuthor}</p>
    </div>
  )
}
