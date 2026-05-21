'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { saveDiaryEntry, updateDiaryEntry } from '@/hooks/useDiaryStore'
import type { DiaryEntry, DiarySlot } from '@/types/diary'

interface DiaryFormProps {
  slot: DiarySlot
  mode?: 'create' | 'edit'
  initialText?: string
  existingEntry?: DiaryEntry
  onSave: (entry: DiaryEntry) => void
  onCancel?: () => void
}

export function DiaryForm({
  slot,
  mode = 'create',
  initialText = '',
  existingEntry,
  onSave,
  onCancel,
}: DiaryFormProps) {
  const [text, setText] = useState(initialText)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/diary/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, slot }),
      })
      if (!res.ok) throw new Error('AI 답글 생성에 실패했어요. 다시 시도해주세요.')
      const data = (await res.json()) as { reply: string }
      const today = new Date().toISOString().split('T')[0]

      let saved: DiaryEntry
      if (mode === 'edit' && existingEntry) {
        saved = updateDiaryEntry(existingEntry.date, existingEntry.slot, {
          text,
          aiReply: data.reply,
        })!
      } else {
        saved = saveDiaryEntry({ date: today, slot, text, aiReply: data.reply })
      }
      onSave(saved)
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white/92 p-4">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        {mode === 'edit' ? '✏️ 기록 수정' : '오늘 어떤 하루인가요?'}
      </p>
      <Textarea
        placeholder="지금의 기분을 짧게 적어보세요…"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 150))}
        maxLength={150}
        disabled={loading}
        className="min-h-[90px] resize-none"
      />
      {mode === 'edit' && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          * 저장하면 AI 답글이 다시 생성됩니다.
        </p>
      )}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{text.length} / 150</span>
        <div className="flex gap-2">
          {mode === 'edit' && onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
              취소
            </Button>
          )}
          <Button size="sm" onClick={handleSubmit} disabled={loading || !text.trim()}>
            {loading ? '생성 중...' : mode === 'edit' ? '저장하기' : '기록하기'}
          </Button>
        </div>
      </div>
    </div>
  )
}
