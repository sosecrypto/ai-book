import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/lib/token-quota', () => ({
  getTokenUsageInfo: vi.fn(),
}))

import { GET } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { getTokenUsageInfo } from '@/lib/token-quota'

const mockRequireAuth = vi.mocked(requireAuth)
const mockGetTokenUsageInfo = vi.mocked(getTokenUsageInfo)

describe('GET /api/usage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 200과 사용량 정보를 반환한다', async () => {
    const mockUsage = {
      used: 5000,
      limit: 50000,
      remaining: 45000,
      plan: 'free',
      percentage: 10,
      periodStart: new Date('2026-02-01'),
      periodEnd: new Date('2026-03-01'),
    }
    mockGetTokenUsageInfo.mockResolvedValue(mockUsage)

    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.used).toBe(5000)
    expect(body.data.limit).toBe(50000)
    expect(body.data.remaining).toBe(45000)
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 },
      ),
    })

    const response = await GET()
    expect(response.status).toBe(401)
  })

  it('서버 에러 시 500을 반환한다', async () => {
    mockGetTokenUsageInfo.mockRejectedValue(new Error('DB error'))

    const response = await GET()
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.success).toBe(false)
  })
})
