import type { TimeSlot } from '@/types/diary'

export function getTimeSlot(hour: number): TimeSlot {
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 24) return 'evening'
  return 'dawn'
}

export function getTimeSlotLabel(slot: TimeSlot): string {
  const labels: Record<TimeSlot, string> = {
    morning: '아침',
    afternoon: '오후',
    evening: '저녁',
    dawn: '새벽',
  }
  return labels[slot]
}

export function getTimeSlotTheme(slot: TimeSlot): string {
  const themes: Record<TimeSlot, string> = {
    morning: 'morning sunrise nature',
    afternoon: 'afternoon sunny landscape',
    evening: 'evening sunset warm',
    dawn: 'night stars moon',
  }
  return themes[slot]
}

export function getTimeSlotRange(slot: TimeSlot): string {
  const ranges: Record<TimeSlot, string> = {
    morning: '06:00–11:59',
    afternoon: '12:00–17:59',
    evening: '18:00–23:59',
    dawn: '00:00–05:59',
  }
  return ranges[slot]
}

export function getTimeSlotEmoji(slot: TimeSlot): string {
  const emojis: Record<TimeSlot, string> = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌇',
    dawn: '🌙',
  }
  return emojis[slot]
}
