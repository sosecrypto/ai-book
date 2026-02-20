import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
  checkProjectOwnership: vi.fn().mockReturnValue(null),
}))

vi.mock('@/lib/db/project-repository', () => ({
  projectRepository: {
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

import { GET, PUT, DELETE } from './route'
import { requireAuth, checkProjectOwnership } from '@/lib/auth/auth-utils'
import { projectRepository } from '@/lib/db/project-repository'

const mockRequireAuth = vi.mocked(requireAuth)
const mockCheckOwnership = vi.mocked(checkProjectOwnership)
const mockFindById = vi.mocked(projectRepository.findById)
const mockUpdate = vi.mocked(projectRepository.update)
const mockDelete = vi.mocked(projectRepository.delete)

const mockParams = { params: Promise.resolve({ id: 'proj-1' }) }
const mockProject = {
  id: 'proj-1',
  title: '테스트',
  type: 'fiction',
  description: '설명',
  status: 'draft',
  userId: 'user-1',
}

function createRequest(method: string, body?: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/projects/proj-1', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  })
}

describe('GET /api/projects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockCheckOwnership.mockReturnValue(null)
  })

  it('성공 시 200과 프로젝트를 반환한다', async () => {
    mockFindById.mockResolvedValue(mockProject as never)

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.id).toBe('proj-1')
  })

  it('프로젝트 없으면 404를 반환한다', async () => {
    mockFindById.mockResolvedValue(null)

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(404)
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: '로그인 필요' }, { status: 401 }),
    })

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(401)
  })

  it('소유권 검증 실패 시 403을 반환한다', async () => {
    mockFindById.mockResolvedValue(mockProject as never)
    mockCheckOwnership.mockReturnValue(
      NextResponse.json({ error: '권한 없음' }, { status: 403 })
    )

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(403)
  })
})

describe('PUT /api/projects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockCheckOwnership.mockReturnValue(null)
  })

  it('성공 시 200과 수정된 프로젝트를 반환한다', async () => {
    mockFindById.mockResolvedValue(mockProject as never)
    mockUpdate.mockResolvedValue({ ...mockProject, title: '수정됨' } as never)

    const response = await PUT(createRequest('PUT', { title: '수정됨' }), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.title).toBe('수정됨')
  })

  it('프로젝트 없으면 404를 반환한다', async () => {
    mockFindById.mockResolvedValue(null)

    const response = await PUT(createRequest('PUT', { title: '수정' }), mockParams)
    expect(response.status).toBe(404)
  })

  it('소유권 검증 실패 시 403을 반환한다', async () => {
    mockFindById.mockResolvedValue(mockProject as never)
    mockCheckOwnership.mockReturnValue(
      NextResponse.json({ error: '권한 없음' }, { status: 403 })
    )

    const response = await PUT(createRequest('PUT', { title: '수정' }), mockParams)
    expect(response.status).toBe(403)
  })
})

describe('DELETE /api/projects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockCheckOwnership.mockReturnValue(null)
  })

  it('성공 시 200을 반환한다', async () => {
    mockFindById.mockResolvedValue(mockProject as never)
    mockDelete.mockResolvedValue(undefined)

    const response = await DELETE(createRequest('DELETE'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })

  it('프로젝트 없으면 404를 반환한다', async () => {
    mockFindById.mockResolvedValue(null)

    const response = await DELETE(createRequest('DELETE'), mockParams)
    expect(response.status).toBe(404)
  })

  it('소유권 검증 실패 시 403을 반환한다', async () => {
    mockFindById.mockResolvedValue(mockProject as never)
    mockCheckOwnership.mockReturnValue(
      NextResponse.json({ error: '권한 없음' }, { status: 403 })
    )

    const response = await DELETE(createRequest('DELETE'), mockParams)
    expect(response.status).toBe(403)
  })
})
