import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/lib/db/project-repository', () => ({
  projectRepository: {
    findById: vi.fn(),
    saveChapter: vi.fn(),
    deleteChapter: vi.fn(),
  },
}))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    chapter: { update: vi.fn().mockResolvedValue({}) },
  },
}))

vi.mock('@/lib/utils/content-context', () => ({
  extractRuleBasedSummary: vi.fn().mockReturnValue('요약'),
  stripHtml: vi.fn().mockImplementation((s: string) => s),
}))

import { POST, DELETE } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { projectRepository } from '@/lib/db/project-repository'

const mockRequireAuth = vi.mocked(requireAuth)
const mockFindById = vi.mocked(projectRepository.findById)
const mockSaveChapter = vi.mocked(projectRepository.saveChapter)
const mockDeleteChapter = vi.mocked(projectRepository.deleteChapter)

const mockParams = { params: Promise.resolve({ id: 'proj-1' }) }

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/projects/proj-1/chapters', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function createDeleteRequest(number?: string): NextRequest {
  const url = number
    ? `http://localhost:3000/api/projects/proj-1/chapters?number=${number}`
    : 'http://localhost:3000/api/projects/proj-1/chapters'
  return new NextRequest(url, { method: 'DELETE' })
}

describe('POST /api/projects/[id]/chapters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockFindById.mockResolvedValue({ id: 'proj-1' } as never)
    mockSaveChapter.mockResolvedValue({ id: 'ch-1', number: 1, title: '챕터1', content: 'test' } as never)
  })

  it('성공 시 200과 챕터를 반환한다', async () => {
    const response = await POST(createPostRequest({
      number: 1,
      title: '챕터 1',
      content: '<p>내용</p>',
    }), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })

  it('Zod 검증 실패 시 400을 반환한다', async () => {
    const response = await POST(createPostRequest({
      number: -1,
      title: '',
      content: '',
    }), mockParams)
    expect(response.status).toBe(400)
  })

  it('프로젝트 없으면 404를 반환한다', async () => {
    mockFindById.mockResolvedValue(null)

    const response = await POST(createPostRequest({
      number: 1,
      title: '챕터 1',
      content: '내용',
    }), mockParams)
    expect(response.status).toBe(404)
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: '로그인 필요' }, { status: 401 }),
    })

    const response = await POST(createPostRequest({
      number: 1,
      title: '챕터 1',
      content: '내용',
    }), mockParams)
    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/projects/[id]/chapters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockDeleteChapter.mockResolvedValue(undefined as never)
  })

  it('성공 시 200을 반환한다', async () => {
    const response = await DELETE(createDeleteRequest('1'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })

  it('number 파라미터 누락 시 400을 반환한다', async () => {
    const response = await DELETE(createDeleteRequest(), mockParams)
    expect(response.status).toBe(400)
  })

  it('유효하지 않은 number 시 400을 반환한다', async () => {
    const response = await DELETE(createDeleteRequest('abc'), mockParams)
    expect(response.status).toBe(400)
  })
})
