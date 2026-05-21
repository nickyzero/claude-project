import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { DIARY_SLOTS } from '@/types/diary'

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const body = (await request.json()) as { text?: unknown; slot?: unknown }
    const { text, slot } = body

    if (typeof text !== 'string' || text.trim().length === 0 || text.length > 150) {
      return NextResponse.json({ error: 'Invalid text: must be 1–150 characters' }, { status: 400 })
    }

    if (typeof slot !== 'string' || !(DIARY_SLOTS as readonly string[]).includes(slot)) {
      return NextResponse.json({ error: 'Invalid slot value' }, { status: 400 })
    }

    const slotLabels: Record<string, string> = {
      morning: '아침',
      afternoon: '오후',
      evening: '저녁',
    }
    const slotLabel = slotLabels[slot] ?? '오늘'

    const { text: reply } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      prompt: `당신은 따뜻한 친구입니다. 사용자가 ${slotLabel}에 쓴 일기에 공감 중심의 답글을 작성해주세요.

규칙:
- 정확히 2-3문장으로만 작성
- 판단이나 조언 없이 감정 공감에만 집중
- 따뜻하고 친근한 친구 톤
- 한국어로만 작성
- 답글 텍스트만 반환 (다른 설명 없이)

일기 내용 (150자 이내):
${text}`,
    })

    return NextResponse.json({ reply: reply.trim() })
  } catch (error) {
    console.error('Diary reply API error:', error)
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 })
  }
}
