import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { HistoryList } from './HistoryList'
import type { DiaryEntry } from '@/types/diary'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const mockEntries: DiaryEntry[] = [
  {
    date: '2026-05-21',
    slot: 'morning',
    text: '아침 일기 내용',
    aiReply: '아침 AI 답글',
    createdAt: 3000,
    updatedAt: 3000,
  },
  {
    date: '2026-05-21',
    slot: 'evening',
    text: '저녁 일기 내용',
    aiReply: '저녁 AI 답글',
    createdAt: 2000,
    updatedAt: 2000,
  },
  {
    date: '2026-05-20',
    slot: 'afternoon',
    text: '오후 일기 내용',
    aiReply: '오후 AI 답글',
    createdAt: 1000,
    updatedAt: 1000,
  },
]

describe('HistoryList', () => {
  it('renders 3 cards when given 3 entries', () => {
    render(<HistoryList entries={mockEntries} />)
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it('shows slot labels — 아침, 저녁, 오후', () => {
    render(<HistoryList entries={mockEntries} />)
    expect(screen.getAllByText(/아침/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/저녁/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/오후/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows date headers', () => {
    render(<HistoryList entries={mockEntries} />)
    expect(screen.getByText('2026년 5월 21일')).toBeInTheDocument()
    expect(screen.getByText('2026년 5월 20일')).toBeInTheDocument()
  })

  it('shows empty state when no entries', () => {
    render(<HistoryList entries={[]} />)
    expect(screen.getByText(/아직 기록이 없어요/)).toBeInTheDocument()
  })

  it('empty state shows 첫 기록 시작하기 link to /', () => {
    render(<HistoryList entries={[]} />)
    const link = screen.getByRole('link', { name: '첫 기록 시작하기' })
    expect(link).toHaveAttribute('href', '/')
  })
})
