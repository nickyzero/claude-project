import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DiaryForm } from './DiaryForm'

describe('DiaryForm', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('enforces 150 character limit — 151st character is not accepted', () => {
    render(<DiaryForm slot="morning" onSave={vi.fn()} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'a'.repeat(155) } })
    expect((textarea as HTMLTextAreaElement).value.length).toBeLessThanOrEqual(150)
  })

  it('shows character counter in "current/150" format', () => {
    render(<DiaryForm slot="morning" onSave={vi.fn()} />)
    expect(screen.getByText('0 / 150')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } })
    expect(screen.getByText('5 / 150')).toBeInTheDocument()
  })

  it('disables button while loading after submit', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => new Promise((resolve) => setTimeout(() => resolve({ reply: 'test' }), 200)),
    }) as unknown as typeof fetch

    render(<DiaryForm slot="morning" onSave={vi.fn()} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '테스트' } })
    const button = screen.getByRole('button', { name: '기록하기' })
    fireEvent.click(button)
    await waitFor(() => expect(button).toBeDisabled())
  })

  it('edit mode: shows hint text about AI reply regeneration', () => {
    render(
      <DiaryForm
        slot="morning"
        mode="edit"
        initialText="원본"
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText(/저장하면 AI 답글이 다시 생성됩니다/)).toBeInTheDocument()
  })

  it('edit mode: cancel calls onCancel without saving', () => {
    const onCancel = vi.fn()
    render(
      <DiaryForm
        slot="morning"
        mode="edit"
        initialText="원본"
        onSave={vi.fn()}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('edit mode: shows 저장하기 button', () => {
    render(
      <DiaryForm
        slot="morning"
        mode="edit"
        initialText="원본"
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument()
  })
})
