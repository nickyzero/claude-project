# daily-quote-diary Learnings

## Task Execution Order & Rationale

Executed in dependency order: types → localStorage hooks → timeslot utils → API routes → components (QuoteCard, DawnScreen, MainPage) → DiaryForm + DiaryView → HistoryList + history page.

DiaryForm was implemented with both create and edit modes upfront (Tasks 4+6 merged) since splitting them would have required a throwaway stub — plan reordering was the right call.

## What Worked Well

1. **Versioned localStorage key pattern** (`haruHanjul:v1:diary:${date}:${slot}`) — cleanly supports future schema migration without conflicting with existing data. Worth reusing in any localStorage-heavy MVP.

2. **RSC boundary placement** — `app/page.tsx` stays as a Server Component that just renders `<MainPage />`. All state lives in the `"use client"` boundary. No metadata leakage, no hydration mismatches.

3. **TimeSlot + DiarySlot type split** — separating `dawn` (for UI routing only) from `DiarySlot` (for persisted entries) caught a potential cast issue in HistoryList before it became a runtime bug.

4. **Gemini model fallback discovery** — `gemini-2.0-flash` had quota = 0 (free tier exhausted). Always probe available models early; `gemini-2.5-flash-lite` worked and is available.

5. **Quote caching in localStorage** — prevents repeated Gemini + Unsplash calls for the same slot/date. Essential for a free-tier API key.

## What Didn't Work

1. **`gemini-2.0-flash` quota** — The API key's free tier had limit = 0 for `gemini-2.0-flash`. This blocked all API routes until switching to `gemini-2.5-flash-lite`. Always validate that the API key has working quota before building on top of an AI model assumption.

2. **`e2e/smoke.spec.ts` picked up by Vitest** — The vitest config excluded `.claude/worktrees/**` and `node_modules/**` but not `e2e/**`. Playwright spec files imported into Vitest caused a `test() not expected here` error. Fixed by adding `"e2e/**"` to the exclude list.
   - **applied: rule** — Add to rules: always exclude `e2e/**` in vitest.config.ts for Next.js projects that use Playwright.

3. **Silent localStorage write failure** — Original `saveDiaryEntry` swallowed `localStorage.setItem` exceptions and returned the entry as if it succeeded. The code-reviewer caught this. Fixed by wrapping callers with try-catch that surfaces an error to the user.

4. **Prompt injection vector** — Diary text was embedded directly in the Gemini prompt string without server-side validation. Fixed by adding a 150-char length cap and `res.ok` check in the route handler. Always validate user-supplied content server-side even when client-side limits exist.

5. **Missing `bg-white/92` Tailwind class** — Used an arbitrary opacity value on `DiaryForm` and `DiaryView` backgrounds. It compiled successfully under Tailwind v4, but it's non-standard. This is fine but worth noting.

## Insights Worth Keeping

1. **API model availability should be probed at project start** — When using AI SDK with a specific model, test that the key has quota for that model before architecting the feature around it. Script: `curl https://generativelanguage.googleapis.com/v1beta/models?key=KEY` + test call.
   - applied: not-yet (single feature, but reusable signal)

2. **Server-side input validation is non-negotiable even for AI prompts** — Client-side `maxLength` and slice don't protect the route handler. Any route that interpolates user text into an AI prompt needs: type check, length cap, and enum validation for categorical fields.
   - applied: rule (add to general API rules)

3. **DiarySlot vs TimeSlot split pattern** — When a slot type drives UI routing (including `dawn`) but only a subset is valid for data storage, create two separate types. Avoids defensive `as TimeSlot` casts in data display components.
   - applied: not-yet (pattern, worth generalizing to other domain-specific slot/status splits)

4. **Quote API should always have a fallback quote** — Network calls can fail. Set a default quote in the client state so the UI degrades gracefully rather than showing a blank card.
   - applied: not-yet

## Scenario Coverage

| Scenario | Status | Notes |
|---|---|---|
| 1. 아침 타임슬롯 — 명언 표시 | ✅ pass | QuoteCard + Unsplash background renders |
| 2. 일기 작성 → AI 답글 | ✅ pass | DiaryForm → /api/diary/reply → DiaryView |
| 3. 재접속 — 기존 일기 표시 | ✅ pass | getDiaryEntry on mount, mode='view' |
| 4. 수정 → AI 답글 재생성 | ✅ pass | mode='edit' → updateDiaryEntry |
| 5. 히스토리 목록 + 빈 상태 | ✅ pass | HistoryList with date groups |
| 6. 150자 초과 방지 | ✅ pass | slice(0,150) in onChange + server 400 |
| 7. 새벽 안내 화면 | ✅ pass | DawnScreen, no diary input |
