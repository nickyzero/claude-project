import { Button } from '@/components/ui/button'
import type { DiaryEntry } from '@/types/diary'

interface DiaryViewProps {
  entry: DiaryEntry
  onEdit: () => void
}

export function DiaryView({ entry, onEdit }: DiaryViewProps) {
  return (
    <div className="rounded-2xl bg-white/92 p-4">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">📝 나의 기록</p>
      <div className="mb-4 rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-foreground">
        {entry.text}
      </div>
      <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
        💬 AI 답글
      </p>
      <div className="mb-3 rounded-lg border-l-2 border-border bg-muted p-3 text-sm leading-relaxed text-muted-foreground">
        {entry.aiReply}
      </div>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onEdit}>
          수정하기
        </Button>
      </div>
    </div>
  )
}
