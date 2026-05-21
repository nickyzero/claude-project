import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { DiaryView } from './DiaryView'
import type { DiaryEntry } from '@/types/diary'

const mockEntry: DiaryEntry = {
  date: '2026-01-01',
  slot: 'morning',
  text: '테스트 일기 내용입니다.',
  aiReply: 'AI 답글 내용입니다.',
  createdAt: 1000,
  updatedAt: 1000,
}

describe('DiaryView', () => {
  it('shows diary text', () => {
    render(<DiaryView entry={mockEntry} onEdit={vi.fn()} />)
    expect(screen.getByText(mockEntry.text)).toBeInTheDocument()
  })

  it('shows AI reply text', () => {
    render(<DiaryView entry={mockEntry} onEdit={vi.fn()} />)
    expect(screen.getByText(mockEntry.aiReply)).toBeInTheDocument()
  })

  it('shows 수정하기 button', () => {
    render(<DiaryView entry={mockEntry} onEdit={vi.fn()} />)
    expect(screen.getByRole('button', { name: '수정하기' })).toBeInTheDocument()
  })

  it('calls onEdit when 수정하기 is clicked', () => {
    const onEdit = vi.fn()
    render(<DiaryView entry={mockEntry} onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button', { name: '수정하기' }))
    expect(onEdit).toHaveBeenCalledOnce()
  })

  it('does not show textarea input field', () => {
    render(<DiaryView entry={mockEntry} onEdit={vi.fn()} />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
