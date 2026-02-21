import { NextRequest, NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { checkRateLimit } from './lib/rate-limit'

const { auth } = NextAuth(authConfig)

const CSRF_EXEMPT_PATHS = ['/api/auth/', '/api/health']
const CSRF_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function verifyCsrf(request: NextRequest): boolean {
  if (!CSRF_METHODS.has(request.method)) return true
  if (CSRF_EXEMPT_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))) return true

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  if (!host) return false

  if (origin) {
    try {
      return new URL(origin).host === host
    } catch {
      return false
    }
  }

  if (referer) {
    try {
      return new URL(referer).host === host
    } catch {
      return false
    }
  }

  return false
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

export default auth(async function proxy(request) {
  // 1. CSRF verification
  if (!verifyCsrf(request)) {
    return NextResponse.json(
      { error: 'CSRF validation failed' },
      { status: 403 }
    )
  }

  // 2. Rate limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = getClientIp(request)
    const result = await checkRateLimit(identifier, request.nextUrl.pathname)

    if (result && !result.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(result.reset),
            'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
          },
        }
      )
    }
  }

  // 3. NextAuth handles auth (via authConfig callbacks)
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
