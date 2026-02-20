import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

function createLimiter(
  prefix: string,
  limit: number,
  window: `${number} ${'s' | 'ms' | 'm' | 'h' | 'd'}`
): Ratelimit | null {
  const redis = createRedis()
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `ratelimit:${prefix}`,
  })
}

export const authLimiter = createLimiter('auth', 5, '1 m')
export const aiLimiter = createLimiter('ai', 10, '1 m')
export const generalLimiter = createLimiter('general', 60, '1 m')

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export async function checkRateLimit(
  identifier: string,
  pathname: string
): Promise<RateLimitResult | null> {
  const limiter = selectLimiter(pathname)
  if (!limiter) return null

  const result = await limiter.limit(identifier)
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}

function selectLimiter(pathname: string): Ratelimit | null {
  if (pathname.startsWith('/api/auth/register')) return authLimiter
  if (isAiRoute(pathname)) return aiLimiter
  if (pathname.startsWith('/api/')) return generalLimiter
  return null
}

function isAiRoute(pathname: string): boolean {
  const aiPatterns = ['/write/', '/generate', '/stream', '/chat/', '/research/', '/outline/', '/edit/']
  return aiPatterns.some((p) => pathname.includes(p))
}
