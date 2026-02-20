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
    project: { findFirst: vi.fn() },
    researchData: { upsert: vi.fn() },
  },
}))

vi.mock('@/lib/claude', () => ({
  runAgent: vi.fn(),
}))

vi.mock('@/lib/token-quota', () => ({
  checkQuota: vi.fn(),
  recordUsage: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/api-utils', () => ({
  handleApiError: vi.fn().mockReturnValue(
    NextResponse.json({ error: 'Internal error' }, { status: 500 }),
  ),
}))

import { POST } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/client'
import { runAgent } from '@/lib/claude'

const mockRequireAuth = vi.mocked(requireAuth)
const mockFindFirst = prisma.project.findFirst as unknown as ReturnType<typeof vi.fn>
const mockUpsert = prisma.researchData.upsert as unknown as ReturnType<typeof vi.fn>
const mockRunAgent = vi.mocked(runAgent)

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/projects/proj-1/research/questions', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockParams = { params: Promise.resolve({ id: 'proj-1' }) }
const mockProject = { id: 'proj-1', type: 'fiction' }

describe('POST /api/projects/[id]/research/questions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockFindFirst.mockResolvedValue(mockProject)
    mockUpsert.mockResolvedValue({})
  })

  it('성공 시 200과 질문 목록을 반환한다', async () => {
    const questionsJson = JSON.stringify({
      questions: [
        { id: 'q1', question: '독자층은?', category: 'audience', priority: 1 },
      ],
    })
    mockRunAgent.mockResolvedValue({ text: questionsJson, usage: { inputTokens: 10, outputTokens: 20 } })

    const response = await POST(createRequest({ initialIdea: '테스트 아이디어' }), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.questions).toHaveLength(1)
    expect(body.questions[0].id).toBe('q1')
  })

  it('JSON 파싱 실패 시 기본 질문을 반환한다', async () => {
    mockRunAgent.mockResolvedValue({ text: '{ invalid json }', usage: { inputTokens: 10, outputTokens: 20 } })

    const response = await POST(createRequest({ initialIdea: '테스트 아이디어' }), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.questions).toHaveLength(5)
    expect(body.questions[0].category).toBe('audience')
  })

  it('initialIdea 누락 시 400을 반환한다', async () => {
    const response = await POST(createRequest({}), mockParams)
    expect(response.status).toBe(400)
  })

  it('프로젝트가 없으면 404를 반환한다', async () => {
    mockFindFirst.mockResolvedValue(null)

    const response = await POST(createRequest({ initialIdea: '아이디어' }), mockParams)
    expect(response.status).toBe(404)
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: '로그인 필요' }, { status: 401 }),
    })

    const response = await POST(createRequest({ initialIdea: '아이디어' }), mockParams)
    expect(response.status).toBe(401)
  })
})
