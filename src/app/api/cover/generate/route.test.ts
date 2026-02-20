import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    coverImage: { upsert: vi.fn() },
  },
}))

vi.mock('@/lib/cover-generator', () => ({
  generateCoverPrompt: vi.fn().mockReturnValue('generated prompt'),
}))

vi.mock('@/lib/cover-templates', () => ({
  getRecommendedTemplate: vi.fn().mockReturnValue({}),
}))

const mockGenerate = vi.fn()

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      images = { generate: mockGenerate }
    },
  }
})

import { POST } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'

const mockRequireAuth = vi.mocked(requireAuth)

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/cover/generate', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/cover/generate', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockGenerate.mockResolvedValue({
      data: [{ url: 'https://example.com/image.png' }],
    })
    process.env = { ...originalEnv, OPENAI_API_KEY: 'test-key' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('성공 시 200과 이미지 URL을 반환한다', async () => {
    const response = await POST(createRequest({
      projectId: 'proj-1',
      title: '테스트',
      type: 'fiction',
    }))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.imageUrl).toBeDefined()
  })

  it('OPENAI_API_KEY 없으면 500을 반환한다', async () => {
    delete process.env.OPENAI_API_KEY

    const response = await POST(createRequest({
      projectId: 'proj-1',
      title: '테스트',
      type: 'fiction',
    }))
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toContain('API 키')
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: '로그인 필요' }, { status: 401 }),
    })

    const response = await POST(createRequest({
      projectId: 'proj-1',
      title: '테스트',
      type: 'fiction',
    }))
    expect(response.status).toBe(401)
  })
})
