import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/lib/db/project-repository', () => ({
  projectRepository: {
    findAll: vi.fn(),
    createWithFile: vi.fn(),
  },
}))

vi.mock('@/lib/api-utils', () => ({
  handleApiError: vi.fn().mockReturnValue(
    NextResponse.json({ error: 'Internal error' }, { status: 500 }),
  ),
}))

import { GET, POST } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { projectRepository } from '@/lib/db/project-repository'

const mockRequireAuth = vi.mocked(requireAuth)
const mockFindAll = vi.mocked(projectRepository.findAll)
const mockCreateWithFile = vi.mocked(projectRepository.createWithFile)

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/projects', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockProject = {
  id: 'proj-1',
  title: '테스트',
  type: 'fiction',
  description: '설명',
  status: 'draft',
}

describe('GET /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 200과 프로젝트 목록을 반환한다', async () => {
    mockFindAll.mockResolvedValue([mockProject] as never)

    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(1)
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: '로그인 필요' }, { status: 401 }),
    })

    const response = await GET()
    expect(response.status).toBe(401)
  })

  it('빈 목록을 정상 반환한다', async () => {
    mockFindAll.mockResolvedValue([])

    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toEqual([])
  })
})

describe('POST /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 201과 생성된 프로젝트를 반환한다', async () => {
    mockCreateWithFile.mockResolvedValue(mockProject as never)

    const response = await POST(createRequest({
      title: '새 책',
      type: 'fiction',
      description: '소설입니다',
    }))
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.id).toBe('proj-1')
  })

  it('title 누락 시 400을 반환한다', async () => {
    const response = await POST(createRequest({
      type: 'fiction',
      description: '설명',
    }))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain('필수')
  })

  it('type 누락 시 400을 반환한다', async () => {
    const response = await POST(createRequest({
      title: '제목',
      description: '설명',
    }))
    expect(response.status).toBe(400)
  })

  it('description 누락 시 400을 반환한다', async () => {
    const response = await POST(createRequest({
      title: '제목',
      type: 'fiction',
    }))
    expect(response.status).toBe(400)
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: '로그인 필요' }, { status: 401 }),
    })

    const response = await POST(createRequest({
      title: '새 책',
      type: 'fiction',
      description: '설명',
    }))
    expect(response.status).toBe(401)
  })
})
