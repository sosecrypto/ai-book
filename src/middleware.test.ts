import { describe, it, expect, vi } from 'vitest'

// Mock dependencies to avoid Prisma/DB side effects
vi.mock('next-auth', () => ({
  default: vi.fn().mockReturnValue({
    auth: vi.fn().mockImplementation((handler: (...args: unknown[]) => unknown) => handler),
  }),
}))

vi.mock('./auth.config', () => ({
  authConfig: {},
}))

vi.mock('./lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}))

import { config } from './proxy'

describe('proxy config matcher', () => {
  const matcher = config.matcher[0]

  function matchesPath(pathname: string): boolean {
    const regexStr = matcher
      .replace(/\\\./g, '\\.')
      .replace(/\\\$/g, '$')

    const regex = new RegExp(`^${regexStr}$`)
    return regex.test(pathname)
  }

  describe('excluded paths (not processed by proxy)', () => {
    it('should exclude static assets', () => {
      expect(matchesPath('/_next/static/chunk.js')).toBe(false)
      expect(matchesPath('/_next/image/photo.jpg')).toBe(false)
    })

    it('should exclude image files', () => {
      expect(matchesPath('/logo.svg')).toBe(false)
      expect(matchesPath('/photo.png')).toBe(false)
      expect(matchesPath('/banner.jpg')).toBe(false)
      expect(matchesPath('/icon.ico')).toBe(false)
    })

    it('should exclude favicon.ico', () => {
      expect(matchesPath('/favicon.ico')).toBe(false)
    })

    it('should exclude /images/ paths', () => {
      expect(matchesPath('/images/cover.png')).toBe(false)
    })
  })

  describe('included paths (processed by proxy)', () => {
    it('should include /projects', () => {
      expect(matchesPath('/projects')).toBe(true)
    })

    it('should include /new', () => {
      expect(matchesPath('/new')).toBe(true)
    })

    it('should include /project/[id]', () => {
      expect(matchesPath('/project/abc123')).toBe(true)
    })

    it('should include /api/projects/*', () => {
      expect(matchesPath('/api/projects')).toBe(true)
      expect(matchesPath('/api/projects/123')).toBe(true)
    })

    it('should include root path /', () => {
      expect(matchesPath('/')).toBe(true)
    })

    it('should include /api/auth paths (for auth handling)', () => {
      expect(matchesPath('/api/auth/signin')).toBe(true)
    })
  })
})
