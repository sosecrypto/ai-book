import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
  projectOwnerWhere: (id: string, userId: string) => ({
    id,
    OR: [{ userId }, { userId: null }],
  }),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    project: { findFirst: vi.fn(), update: vi.fn() },
  },
}))

vi.mock('@/lib/claude', () => ({
  runAgent: vi.fn(),
}))

vi.mock('@/lib/token-quota', () => ({
  checkQuota: vi.fn(),
  recordUsage: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/plot-structures', () => ({
  PLOT_STRUCTURES: {},
}))

import { POST } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/client'
import { runAgent } from '@/lib/claude'
import { checkQuota } from '@/lib/token-quota'

const mockRequireAuth = vi.mocked(requireAuth)
const mockCheckQuota = vi.mocked(checkQuota)
const mockFindFirst = prisma.project.findFirst as unknown as ReturnType<typeof vi.fn>
const mockUpdate = prisma.project.update as unknown as ReturnType<typeof vi.fn>
const mockRunAgent = vi.mocked(runAgent)

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/projects/proj-1/outline/generate', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockParams = { params: Promise.resolve({ id: 'proj-1' }) }
const mockProject = {
  id: 'proj-1',
  title: '테스트 프로젝트',
  type: 'fiction',
  description: '테스트 설명',
  researchData: null,
}

describe('POST /api/projects/[id]/outline/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockCheckQuota.mockResolvedValue(undefined)
    mockFindFirst.mockResolvedValue(mockProject)
    mockUpdate.mockResolvedValue({})
  })

  it('성공 시 200과 outline을 반환한다', async () => {
    const outlineJson = JSON.stringify({
      synopsis: '테스트 시놉시스',
      chapters: [
        { number: 1, title: '챕터 1', summary: '요약', keyPoints: [], sections: [] },
      ],
      estimatedPages: 200,
      targetAudience: '일반',
      tone: 'casual',
    })
    mockRunAgent.mockResolvedValue({ text: outlineJson, usage: { inputTokens: 100, outputTokens: 200 } })

    const response = await POST(createRequest({}), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.outline.chapters).toHaveLength(1)
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('AI JSON 파싱 실패 시 기본 목차를 반환한다', async () => {
    mockRunAgent.mockResolvedValue({ text: 'invalid json', usage: { inputTokens: 10, outputTokens: 20 } })

    const response = await POST(createRequest({}), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.outline.chapters.length).toBeGreaterThan(0)
  })

  it('프로젝트가 없으면 404를 반환한다', async () => {
    mockFindFirst.mockResolvedValue(null)

    const response = await POST(createRequest({}), mockParams)
    expect(response.status).toBe(404)
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: '로그인 필요' }, { status: 401 }),
    })

    const response = await POST(createRequest({}), mockParams)
    expect(response.status).toBe(401)
  })

  it('Zod 검증 실패 시 400을 반환한다', async () => {
    const response = await POST(createRequest({
      targetLength: -1,
    }), mockParams)
    expect(response.status).toBe(400)
  })
})
