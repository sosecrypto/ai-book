import { NextResponse } from 'next/server'

export function handleApiError(
  error: unknown,
  context: Record<string, string> = {}
): NextResponse {
  console.error('API Error:', error)

  if (process.env.SENTRY_DSN) {
    import('@sentry/nextjs').then(({ captureException }) => {
      captureException(error, { tags: context })
    }).catch(() => {
      // Sentry import failed silently
    })
  }

  const message = error instanceof Error ? error.message : 'Internal server error'

  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  )
}
