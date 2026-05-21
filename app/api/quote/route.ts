import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { getTimeSlotTheme } from '@/lib/timeslot'
import type { TimeSlot } from '@/types/diary'

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY

  if (!apiKey || !unsplashKey) {
    return NextResponse.json({ error: 'API keys not configured' }, { status: 500 })
  }

  try {
    const { slot } = (await request.json()) as { slot: TimeSlot }

    const slotPrompts: Record<string, string> = {
      morning: '희망, 동기, 새로운 시작',
      afternoon: '에너지, 생산성, 집중',
      evening: '감사, 하루 마무리, 회고',
      dawn: '고요함, 밤의 성찰',
    }
    const theme = slotPrompts[slot] ?? slotPrompts.morning

    const { text: quoteResponse } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      prompt: `다음 테마에 맞는 한국어 명언을 하나 생성해주세요: ${theme}

JSON 형식으로만 반환하세요 (다른 텍스트 없이):
{"text":"명언 내용","author":"출처(인물명 또는 출처)"}

실제 인물의 명언이나 책의 구절을 사용하고, 한국어로 작성해주세요.`,
    })

    let quoteText = '오늘 하루도 특별한 날입니다.'
    let quoteAuthor = '하루한줄'
    try {
      const jsonMatch = quoteResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        quoteText = parsed.text ?? quoteText
        quoteAuthor = parsed.author ?? quoteAuthor
      }
    } catch {}

    const unsplashQuery = getTimeSlotTheme(slot)
    const unsplashRes = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(unsplashQuery)}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${unsplashKey}` } }
    )

    let backgroundUrl = ''
    if (unsplashRes.ok) {
      const unsplashData = (await unsplashRes.json()) as { urls?: { regular?: string } }
      backgroundUrl = unsplashData.urls?.regular ?? ''
    }

    return NextResponse.json({ quoteText, quoteAuthor, backgroundUrl })
  } catch (error) {
    console.error('Quote API error:', error)
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 500 })
  }
}
