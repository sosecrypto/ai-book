import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
          <div className="mb-4 text-4xl">&#x26A0;</div>
          <h1 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
            인증 오류
          </h1>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            로그인 중 문제가 발생했습니다. 다시 시도해주세요.
          </p>
          <Link
            href="/auth/login"
            className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
