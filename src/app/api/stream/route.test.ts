import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/agents/writer', () => ({
  runWriterAgentWithUsage: vi.fn(),
}))

vi.mock('@/lib/token-quota', () => ({
  checkQuota: vi.fn(),
  recordUsage: vi.fn().mockResolvedValue(undefined),
}))

import { POST } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { runWriterAgentWithUsage } from '@/agents/writer'
import { checkQuota } from '@/lib/token-quota'
import { AppError, ERROR_CODES } from '@/lib/errors'

const mockRequireAuth = vi.mocked(requireAuth)
const mockCheckQuota = vi.mocked(checkQuota)

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/stream', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/stream', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockCheckQuota.mockResolvedValue(undefined)
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: '로그인 필요' }, { status: 401 }),
    })

    const response = await POST(createRequest({ phase: 'write' }))
    expect(response.status).toBe(401)
  })

  it('write가 아닌 phase 시 400을 반환한다', async () => {
    const response = await POST(createRequest({
      phase: 'research',
      bookType: 'fiction',
      outline: {},
      chapter: { number: 1, title: '챕터1' },
    }))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain('streaming')
  })

  it('SSE 스트리밍 응답을 반환한다', async () => {
    vi.mocked(runWriterAgentWithUsage).mockResolvedValue({
      text: '완성된 텍스트',
      usage: { inputTokens: 100, outputTokens: 200 },
    })

    const response = await POST(createRequest({
      phase: 'write',
      bookType: 'fiction',
      outline: { chapters: [] },
      chapter: { number: 1, title: '챕터1' },
    }))

    expect(response.headers.get('Content-Type')).toBe('text/event-stream')

    const text = await response.text()
    expect(text).toContain('event: start')
    expect(text).toContain('event: complete')
  })

  it('quota 초과 시 429를 반환한다', async () => {
    mockCheckQuota.mockRejectedValue(new AppError(ERROR_CODES.QUOTA_EXCEEDED))

    const response = await POST(createRequest({
      phase: 'write',
      bookType: 'fiction',
      outline: {},
      chapter: { number: 1 },
    }))
    expect(response.status).toBe(429)
  })

  it('일반 에러 시 500을 반환한다', async () => {
    mockCheckQuota.mockRejectedValue(new Error('Unknown'))

    const response = await POST(createRequest({
      phase: 'write',
      bookType: 'fiction',
      outline: {},
      chapter: { number: 1 },
    }))
    expect(response.status).toBe(500)
  })
})
