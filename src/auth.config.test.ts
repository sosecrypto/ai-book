import { describe, it, expect } from 'vitest'
import { authConfig } from './auth.config'

describe('auth.config authorized callback', () => {
  const authorized = authConfig.callbacks.authorized

  function createMockArgs(pathname: string, isLoggedIn: boolean) {
    return {
      auth: isLoggedIn ? { user: { id: '1', email: 'test@test.com' } } : null,
      request: {
        nextUrl: new URL(`http://localhost:3000${pathname}`),
      },
    }
  }

  describe('public paths', () => {
    const publicPaths = [
      '/',
      '/auth/login',
      '/auth/register',
      '/auth/error',
      '/api/auth/signin',
      '/api/auth/callback/google',
      '/api/health',
      '/privacy',
      '/terms',
      '/features',
      '/pricing',
    ]

    publicPaths.forEach((path) => {
      it(`should allow unauthenticated access to ${path}`, () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = authorized(createMockArgs(path, false) as any)
        expect(result).toBe(true)
      })
    })
  })

  describe('protected paths (unauthenticated)', () => {
    const protectedPaths = [
      '/projects',
      '/new',
      '/project/abc123',
      '/api/projects',
      '/api/generate',
    ]

    protectedPaths.forEach((path) => {
      it(`should deny unauthenticated access to ${path}`, () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = authorized(createMockArgs(path, false) as any)
        expect(result).toBe(false)
      })
    })
  })

  describe('protected paths (authenticated)', () => {
    const protectedPaths = [
      '/projects',
      '/new',
      '/project/abc123',
    ]

    protectedPaths.forEach((path) => {
      it(`should allow authenticated access to ${path}`, () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = authorized(createMockArgs(path, true) as any)
        expect(result).toBe(true)
      })
    })
  })
})
