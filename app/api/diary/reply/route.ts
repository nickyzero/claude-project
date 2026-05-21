import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const { text, slot } = (await request.json()) as { text: string; slot: string }

    const slotLabels: Record<string, string> = {
      morning: '아침',
      afternoon: '오후',
      evening: '저녁',
    }
    const slotLabel = slotLabels[slot] ?? '오늘'

    const { text: reply } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: `당신은 따뜻한 친구입니다. 사용자가 ${slotLabel}에 쓴 일기에 공감 중심의 답글을 작성해주세요.

규칙:
- 정확히 2-3문장으로만 작성
- 판단이나 조언 없이 감정 공감에만 집중
- 따뜻하고 친근한 친구 톤
- 한국어로만 작성
- 답글 텍스트만 반환 (다른 설명 없이)

일기 내용: "${text}"`,
    })

    return NextResponse.json({ reply: reply.trim() })
  } catch (error) {
    console.error('Diary reply API error:', error)
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 })
  }
}
