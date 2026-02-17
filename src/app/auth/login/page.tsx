import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-bold text-neutral-900 dark:text-white">
            로그인
          </h1>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            계정이 없으신가요?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
