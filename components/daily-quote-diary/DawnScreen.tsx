import Link from 'next/link'

export function DawnScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a2e] px-6 text-center">
      <div className="mb-4 text-5xl">🌙</div>
      <h1 className="mb-2 text-xl font-bold text-white">아직 이른 시간이에요</h1>
      <p className="mb-8 text-sm text-white/50">
        06:00에 다시 오세요 🌅
        <br />
        오늘의 명언이 기다리고 있어요.
      </p>
      <Link
        href="/history"
        className="rounded-full border border-white/30 px-5 py-2 text-sm text-white/60 transition-colors hover:text-white/80"
      >
        지난 기록 보기
      </Link>
    </div>
  )
}
