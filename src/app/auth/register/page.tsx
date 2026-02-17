import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-bold text-neutral-900 dark:text-white">
            회원가입
          </h1>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
