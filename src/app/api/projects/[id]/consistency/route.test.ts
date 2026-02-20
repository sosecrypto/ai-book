import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    project: { findUnique: vi.fn() },
  },
}))

vi.mock('@/agents/consistency-checker', () => ({
  runConsistencyCheck: vi.fn(),
}))

import { POST } from './route'
import { prisma } from '@/lib/db/client'
import { runConsistencyCheck } from '@/agents/consistency-checker'

const mockFindUnique = prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>
const mockRunCheck = vi.mocked(runConsistencyCheck)

const mockParams = { params: Promise.resolve({ id: 'proj-1' }) }

function createRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/projects/proj-1/consistency', {
    method: 'POST',
  })
}

describe('POST /api/projects/[id]/consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('챕터 2개 이상이면 일관성 검사를 실행한다', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'proj-1',
      chapters: [
        { number: 1, title: '챕터1', content: '내용1' },
        { number: 2, title: '챕터2', content: '내용2' },
      ],
    })
    mockRunCheck.mockResolvedValue({
      issues: [],
      checkedAt: new Date(),
      chapterCount: 2,
      summary: 'OK',
    } as never)

    const response = await POST(createRequest(), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.report).toBeDefined()
    expect(mockRunCheck).toHaveBeenCalled()
  })

  it('챕터 2개 미만이면 검사 없이 반환한다', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'proj-1',
      chapters: [{ number: 1, title: '챕터1', content: '내용' }],
    })

    const response = await POST(createRequest(), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.report.summary).toContain('2개 미만')
    expect(mockRunCheck).not.toHaveBeenCalled()
  })

  it('프로젝트 없으면 404를 반환한다', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await POST(createRequest(), mockParams)
    expect(response.status).toBe(404)
  })
})
