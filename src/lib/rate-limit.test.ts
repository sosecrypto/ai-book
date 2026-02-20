import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockLimit } = vi.hoisted(() => ({
  mockLimit: vi.fn(),
}))

vi.mock('@upstash/redis', () => {
  return {
    Redis: class MockRedis {
      constructor() {
        // Mock Redis instance
      }
    },
  }
})

vi.mock('@upstash/ratelimit', () => {
  class MockRatelimit {
    limit = mockLimit
    static slidingWindow() {
      return 'sliding-window'
    }
  }
  return { Ratelimit: MockRatelimit }
})

describe('rate-limit', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env = {
      ...originalEnv,
      UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'test-token',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return rate limit result for API routes', async () => {
    mockLimit.mockResolvedValue({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60000,
    })

    const { checkRateLimit } = await import('./rate-limit')
    const result = await checkRateLimit('127.0.0.1', '/api/projects')

    expect(result).not.toBeNull()
    expect(result!.success).toBe(true)
    expect(result!.limit).toBe(60)
  })

  it('should return null for non-API routes', async () => {
    const { checkRateLimit } = await import('./rate-limit')
    const result = await checkRateLimit('127.0.0.1', '/dashboard')

    expect(result).toBeNull()
  })

  it('should return null when Upstash is not configured', async () => {
    delete (process.env as Record<string, string | undefined>).UPSTASH_REDIS_REST_URL
    delete (process.env as Record<string, string | undefined>).UPSTASH_REDIS_REST_TOKEN

    const { checkRateLimit } = await import('./rate-limit')
    const result = await checkRateLimit('127.0.0.1', '/api/projects')

    expect(result).toBeNull()
  })

  it('should use AI limiter for AI routes', async () => {
    mockLimit.mockResolvedValue({
      success: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60000,
    })

    const { checkRateLimit } = await import('./rate-limit')
    const result = await checkRateLimit('user-1', '/api/projects/123/write/something')

    expect(result).not.toBeNull()
    expect(result!.success).toBe(false)
    expect(result!.limit).toBe(10)
  })
})
