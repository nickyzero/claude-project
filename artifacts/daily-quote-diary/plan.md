# daily-quote-diary 구현 계획

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| API 키 보호 | Route Handler (`/api/quote`, `/api/diary/reply`) | `GOOGLE_GENERATIVE_AI_API_KEY`, `UNSPLASH_ACCESS_KEY`를 서버 전용으로 유지 |
| 데이터 저장 | localStorage (버전 prefix 키) | 로그인 없는 MVP, `try-catch` 필수 |
| 클라이언트 상태 | React `useState` + `useDiaryStore` 훅 | 단일 페이지 스코프, Zustand 불필요 |
| 배경 이미지 캐싱 | localStorage에 URL 저장 (날짜+슬롯 키) | 타임슬롯당 하루 1회 Unsplash 호출로 제한 |
| 시간대 감지 | 클라이언트 측 `getTimeSlot()` | 로컬 시각 기반, SSR hydration mismatch 방지를 위해 `"use client"` 래퍼 안에서만 호출 |
| 메인 페이지 구조 | `app/page.tsx`(Server) → `MainPage`(Client) | RSC 경계: Server Component는 메타데이터만, 실제 로직은 Client Component |

---

## 인프라 리소스

| 리소스 | 유형 | 선언 위치 | 생성 Task |
|---|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Env var | `.env.local` | Task 2 |
| `UNSPLASH_ACCESS_KEY` | Env var | `.env.local` | Task 2 |

> 두 키 모두 `.env.local`에 없으면 Task 2 Route Handler가 500을 반환한다. 구현 시작 전 발급 필요.

---

## 데이터 모델

### TimeSlot
- `'morning'` | `'afternoon'` | `'evening'` | `'dawn'`

### DiaryEntry
- `date: string` — `YYYY-MM-DD` (required)
- `slot: 'morning' | 'afternoon' | 'evening'` (required)
- `text: string` — 최대 150자 (required)
- `aiReply: string` (required)
- `createdAt: number` (required)
- `updatedAt: number` (required)

### QuoteCache
- `date: string` — `YYYY-MM-DD`
- `slot: TimeSlot`
- `quoteText: string`
- `quoteAuthor: string`
- `backgroundUrl: string`
- `cachedAt: number`

**localStorage 키 패턴**
```
haruHanjul:v1:diary:${YYYY-MM-DD}:${slot}   → DiaryEntry (JSON)
haruHanjul:v1:quote:${YYYY-MM-DD}:${slot}   → QuoteCache (JSON)
```

---

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| `shadcn` | Task 3–7 | Card, Button, Textarea, Badge, Field, Separator 사용 규칙 |
| `next-best-practices` | Task 2, 4 | Route Handler 구조, RSC 경계 |
| `vercel-react-best-practices` | Task 1 | localStorage 버전 관리, try-catch 패턴 |
| `vercel-react-best-practices` (AI SDK) | Task 2, 4 | Vercel AI SDK + `@ai-sdk/google` (Gemini) 호출 |

---

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `types/diary.ts` | New | Task 1 |
| `hooks/useDiaryStore.ts` | New | Task 1 |
| `hooks/useDiaryStore.test.ts` | New | Task 1 |
| `lib/timeslot.ts` | New | Task 2 |
| `lib/timeslot.test.ts` | New | Task 2 |
| `app/api/quote/route.ts` | New | Task 2 |
| `components/daily-quote-diary/QuoteCard.tsx` | New | Task 3 |
| `components/daily-quote-diary/DawnScreen.tsx` | New | Task 3 |
| `components/daily-quote-diary/MainPage.tsx` | New | Task 3 |
| `app/page.tsx` | Modify | Task 3 |
| `app/layout.tsx` | Modify | Task 3 |
| `components/daily-quote-diary/DiaryForm.tsx` | New | Task 4 |
| `components/daily-quote-diary/DiaryForm.test.tsx` | New | Task 4 |
| `app/api/diary/reply/route.ts` | New | Task 4 |
| `components/daily-quote-diary/DiaryView.tsx` | New | Task 5 |
| `components/daily-quote-diary/DiaryView.test.tsx` | New | Task 5 |
| `components/daily-quote-diary/DiaryForm.tsx` | Modify | Task 6 |
| `app/history/page.tsx` | New | Task 7 |
| `components/daily-quote-diary/HistoryList.tsx` | New | Task 7 |
| `components/daily-quote-diary/HistoryList.test.tsx` | New | Task 7 |

---

## Tasks

### Task 1: 타입 정의 + localStorage 훅

- **담당 시나리오**: 시나리오 2, 3, 4, 5 (데이터 계층 기반)
- **크기**: S (2 파일 + 1 테스트)
- **의존성**: None
- **참조**:
  - `vercel-react-best-practices` — `client-localstorage-schema` (버전 prefix, try-catch)
  - `CLAUDE.md` 아키텍처: `types/` → `hooks/` 순서
- **구현 대상**:
  - `types/diary.ts` — `TimeSlot`, `DiaryEntry`, `QuoteCache` 타입
  - `hooks/useDiaryStore.ts` — `getDiaryEntry`, `saveDiaryEntry`, `updateDiaryEntry`, `getAllEntries`, `getQuoteCache`, `saveQuoteCache`
  - `hooks/useDiaryStore.test.ts`
- **수용 기준**:
  - [ ] `saveDiaryEntry({ date:'2026-01-01', slot:'morning', text:'테스트', aiReply:'답글', ... })` 호출 후 `getDiaryEntry('2026-01-01','morning')`이 같은 text를 반환한다
  - [ ] `updateDiaryEntry`로 text 변경 후 `getDiaryEntry`가 새 text와 갱신된 `updatedAt`을 반환한다
  - [ ] `getAllEntries()`가 저장된 모든 DiaryEntry를 `createdAt` 내림차순으로 반환한다
  - [ ] `saveQuoteCache` 후 `getQuoteCache`가 같은 quoteText를 반환한다
  - [ ] localStorage 접근 불가 환경(getItem 예외)에서 `getDiaryEntry`가 null을 반환하고 예외를 던지지 않는다
- **검증**: `bun run test -- useDiaryStore`

---

### Task 2: 시간대 유틸 + 명언 API Route (고위험)

- **담당 시나리오**: 시나리오 1 (아침 명언 표시), 시나리오 7 (새벽 감지 기반)
- **크기**: M (3 파일 + 1 테스트)
- **의존성**: Task 1 (QuoteCache 타입)
- **참조**:
  - `next-best-practices` — `route-handlers` (Route Handler 구조)
  - Vercel AI SDK + `@ai-sdk/google` — `generateText()` 호출
  - Unsplash API: `https://api.unsplash.com/photos/random?query=${theme}&orientation=landscape`
- **구현 대상**:
  - `lib/timeslot.ts` — `getTimeSlot(hour)`, `getTimeSlotLabel`, `getTimeSlotTheme`, `getTimeSlotRange`
  - `lib/timeslot.test.ts`
  - `app/api/quote/route.ts` — `POST { slot }` → Gemini API로 한국어 명언 생성 + Unsplash 배경 URL 반환
- **수용 기준**:
  - [ ] `getTimeSlot(7)` → `'morning'`, `getTimeSlot(14)` → `'afternoon'`, `getTimeSlot(20)` → `'evening'`, `getTimeSlot(3)` → `'dawn'`
  - [ ] `POST /api/quote` body `{ slot: 'morning' }` → `200 { quoteText, quoteAuthor, backgroundUrl }` (quoteText가 한국어 문자열, backgroundUrl이 유효한 URL)
  - [ ] `GOOGLE_GENERATIVE_AI_API_KEY` 또는 `UNSPLASH_ACCESS_KEY` 미설정 시 `POST /api/quote` → `500 { error: string }`
- **검증**:
  - `bun run test -- timeslot`
  - `bun run dev` 후 `curl -X POST http://localhost:3000/api/quote -d '{"slot":"morning"}'`로 응답 확인

---

### Task 3: 메인 페이지 — 명언 카드 + 새벽 화면

- **담당 시나리오**: 시나리오 1 (아침 명언 + 배경), 시나리오 7 (새벽 안내)
- **크기**: M (4 파일)
- **의존성**: Task 1 (QuoteCache 훅), Task 2 (quote API + timeslot)
- **참조**:
  - `shadcn` — `Card`, `Badge`, semantic colors (`bg-background/80`, `text-foreground`)
  - wireframe 상태 A (명언 카드 레이아웃), 상태 D (새벽 화면)
- **구현 대상**:
  - `components/daily-quote-diary/QuoteCard.tsx` — 타임슬롯 배지 + 명언 텍스트 + 출처, 배경 이미지 오버레이
  - `components/daily-quote-diary/DawnScreen.tsx` — "06:00에 다시 오세요 🌅" + 히스토리 링크
  - `components/daily-quote-diary/MainPage.tsx` — `"use client"`, 시간대 감지, quote API 호출, 로딩 상태
  - `app/page.tsx` — Server Component, `<MainPage />` 렌더
  - `app/layout.tsx` — metadata: title "하루한줄", description 업데이트
- **수용 기준**:
  - [ ] 06:00–11:59 접속(mock) → 화면에 타임슬롯 배지 "아침"과 한국어 명언 텍스트가 표시된다
  - [ ] 배경 이미지 URL이 유효할 때 → `<img>` 또는 CSS background로 이미지가 렌더된다
  - [ ] 00:00–05:59 접속(mock) → 일기 입력 필드가 보이지 않고 "06:00에 다시 오세요" 문구가 표시된다
  - [ ] 00:00–05:59 접속(mock) → 히스토리로 이동하는 링크가 표시되고, 클릭 시 `/history`로 이동한다
- **검증**: `bun run dev` → 브라우저에서 `http://localhost:3000` 접속, 시간대별 화면 확인

---

### Checkpoint: Tasks 1–3 이후

- [ ] `bun run test` — 전체 테스트 통과
- [ ] `bun run build` — 빌드 성공
- [ ] 브라우저에서 메인 페이지 접속 시 명언 카드 + 배경 이미지가 표시된다

---

### Task 4: 일기 입력 폼 + AI 답글 API Route (고위험)

- **담당 시나리오**: 시나리오 2 (일기 작성 → AI 답글), 시나리오 6 (150자 초과 방지)
- **크기**: M (3 파일 + 1 테스트)
- **의존성**: Task 1 (saveDiaryEntry), Task 2 (timeslot)
- **참조**:
  - `shadcn` — `Field`, `FieldGroup`, `Textarea` (폼 레이아웃 규칙)
  - Vercel AI SDK + `@ai-sdk/google` — `generateText()` 호출, 감정 분석 프롬프트 설계
  - wireframe 상태 A (입력 필드), 상태 B (로딩)
- **구현 대상**:
  - `app/api/diary/reply/route.ts` — `POST { text, slot }` → Gemini API 감정 분석 + 따뜻한 친구 톤 답글 (2–3문장) 반환
  - `components/daily-quote-diary/DiaryForm.tsx` — textarea (maxLength=150), 글자수 카운터, "기록하기" 버튼, 로딩 상태
  - `components/daily-quote-diary/DiaryForm.test.tsx`
- **수용 기준**:
  - [ ] textarea에 151번째 글자 입력 시도 → 텍스트가 150자를 넘지 않는다
  - [ ] 텍스트 입력 중 → `"현재글자수/150"` 형식의 카운터가 표시된다
  - [ ] "기록하기" 클릭 → 버튼이 로딩 상태(비활성화)로 전환된다
  - [ ] `POST /api/diary/reply` body `{ text: "오늘 힘들었어요", slot: "morning" }` → `200 { reply: string }` (reply가 2–3문장 한국어)
  - [ ] API 응답 완료 → 화면에 입력한 일기 텍스트와 AI 답글이 함께 표시된다
  - [ ] API 응답 완료 → "기록하기" 버튼이 사라지고 "수정하기" 버튼이 나타난다
- **검증**:
  - `bun run test -- DiaryForm`
  - `bun run dev` → 일기 작성 후 AI 답글 수신 확인

---

### Task 5: 일기 결과 뷰 + 재접속 상태 유지

- **담당 시나리오**: 시나리오 3 (재접속 시 기존 일기 표시), 시나리오 2 (수용 기준 일부)
- **크기**: S (2 파일 + 1 테스트)
- **의존성**: Task 1 (getDiaryEntry), Task 4 (DiaryForm 연동)
- **참조**:
  - `shadcn` — `Card`, semantic colors
  - wireframe 상태 B
- **구현 대상**:
  - `components/daily-quote-diary/DiaryView.tsx` — 일기 텍스트 + AI 답글 + "수정하기" 버튼
  - `components/daily-quote-diary/DiaryView.test.tsx`
- **수용 기준**:
  - [ ] 오늘 타임슬롯에 일기가 저장된 상태로 페이지 새로고침 → 일기 입력 필드 없이 기존 일기 텍스트와 AI 답글이 표시된다
  - [ ] 기존 일기가 있는 상태로 재접속 → "수정하기" 버튼이 표시된다
  - [ ] 기존 일기가 있는 상태로 재접속 → 새 일기 입력 필드가 보이지 않는다
- **검증**:
  - `bun run test -- DiaryView`
  - 브라우저: 일기 작성 → 새로고침 → 일기 + 답글이 그대로 표시되는지 확인

---

### Checkpoint: Tasks 4–5 이후

- [ ] `bun run test` — 전체 테스트 통과
- [ ] `bun run build` — 빌드 성공
- [ ] 핵심 루프 end-to-end 동작: 명언 보기 → 일기 쓰기 → AI 답글 수신 → 새로고침 후 유지

---

### Task 6: 일기 수정 모드

- **담당 시나리오**: 시나리오 4 (수정 → AI 답글 재생성)
- **크기**: S (DiaryForm.tsx 수정 + 테스트 추가)
- **의존성**: Task 4 (DiaryForm), Task 5 (DiaryView), Task 1 (updateDiaryEntry)
- **참조**:
  - wireframe 상태 C
- **구현 대상**:
  - `components/daily-quote-diary/DiaryForm.tsx` — `mode: 'create' | 'edit'` prop, 편집 모드에서 기존 텍스트 초기화, "저장하기"/"취소" 버튼, "저장하면 AI 답글이 다시 생성됩니다." 힌트 텍스트
  - `components/daily-quote-diary/DiaryForm.test.tsx` — 편집 모드 케이스 추가 (취소 시 원본 유지, 저장 시 새 답글, 150자 제한 유지)
- **수용 기준**:
  - [ ] "수정하기" 클릭 → 일기 텍스트가 편집 가능한 상태로 전환된다
  - [ ] 편집 모드에서 "저장하면 AI 답글이 다시 생성됩니다." 힌트 텍스트가 표시된다
  - [ ] 내용 변경 후 "저장하기" 클릭 → 수정된 일기 텍스트와 새 AI 답글이 표시된다
  - [ ] "취소" 클릭 → 원래 일기와 AI 답글이 그대로 유지된다
- **검증**:
  - `bun run test -- DiaryForm`
  - 브라우저: 수정 후 저장 → 새 AI 답글 확인

---

### Task 7: 히스토리 페이지

- **담당 시나리오**: 시나리오 5 (히스토리 목록 + 빈 상태)
- **크기**: M (3 파일 + 1 테스트)
- **의존성**: Task 1 (getAllEntries)
- **참조**:
  - `shadcn` — `Card`, `Badge`, `Separator`
  - wireframe 상태 E, F
- **구현 대상**:
  - `app/history/page.tsx` — `"use client"`, 헤더(← 돌아가기 + "나의 기록"), `<HistoryList />`
  - `components/daily-quote-diary/HistoryList.tsx` — 날짜 내림차순 그룹, 각 카드(타임슬롯 배지 + 일기 50자 + AI 답글 50자), 빈 상태
  - `components/daily-quote-diary/HistoryList.test.tsx`
- **수용 기준**:
  - [ ] 저장된 일기 3개(날짜/슬롯 다름) → 목록에 3개의 카드가 렌더된다
  - [ ] 각 카드에 날짜와 타임슬롯 이름(아침/오후/저녁)이 표시된다
  - [ ] 저장된 일기가 없을 때 → "아직 기록이 없어요" 문구가 표시된다
  - [ ] "← 돌아가기" 클릭 → 메인 페이지(`/`)로 이동한다
  - [ ] 저장된 일기가 없을 때 "첫 기록 시작하기" 클릭 → 메인 페이지(`/`)로 이동한다
- **검증**:
  - `bun run test -- HistoryList`
  - 브라우저: 일기 2–3개 작성 후 히스토리 페이지 접속 → 목록 확인

---

### Checkpoint: 최종

- [ ] `bun run test` — 전체 테스트 통과
- [ ] `bun run build` — 빌드 성공
- [ ] spec.md 7개 시나리오 전체 브라우저 수동 검증 완료

---

## 미결정 항목

- 없음 (모든 고비용 결정 확정)
