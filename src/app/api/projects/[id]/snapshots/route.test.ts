import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
  checkProjectOwnership: vi.fn().mockReturnValue(null),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    project: { findUnique: vi.fn() },
    projectSnapshot: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { GET, POST, DELETE } from './route'
import { requireAuth, checkProjectOwnership } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/client'

const mockRequireAuth = vi.mocked(requireAuth)
const mockCheckOwnership = vi.mocked(checkProjectOwnership)
const mockFindUnique = prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>
const mockFindMany = prisma.projectSnapshot.findMany as unknown as ReturnType<typeof vi.fn>
const mockCreate = prisma.projectSnapshot.create as unknown as ReturnType<typeof vi.fn>
const mockCount = prisma.projectSnapshot.count as unknown as ReturnType<typeof vi.fn>

const mockParams = { params: Promise.resolve({ id: 'proj-1' }) }
const mockProject = {
  id: 'proj-1',
  userId: 'user-1',
  stage: 'write',
  outline: null,
  bible: null,
  chapters: [{ number: 1, title: '챕터1', content: '내용', status: 'draft' }],
}

function createRequest(method: string, body?: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/projects/proj-1/snapshots', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  })
}

describe('GET /api/projects/[id]/snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockCheckOwnership.mockReturnValue(null)
  })

  it('성공 시 200과 스냅샷 목록을 반환한다', async () => {
    mockFindUnique.mockResolvedValue({ userId: 'user-1' })
    mockFindMany.mockResolvedValue([{ id: 'snap-1', label: '테스트' }])

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toHaveLength(1)
  })

  it('프로젝트 없으면 404를 반환한다', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(404)
  })
})

describe('POST /api/projects/[id]/snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockCheckOwnership.mockReturnValue(null)
    mockFindUnique.mockResolvedValue(mockProject)
    mockCount.mockResolvedValue(5)
    mockCreate.mockResolvedValue({ id: 'snap-new', label: '스냅샷' })
  })

  it('성공 시 200과 생성된 스냅샷을 반환한다', async () => {
    const response = await POST(createRequest('POST', { label: '스냅샷' }), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })

  it('label 누락 시 400을 반환한다', async () => {
    const response = await POST(createRequest('POST', {}), mockParams)
    expect(response.status).toBe(400)
  })

  it('프로젝트 없으면 404를 반환한다', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await POST(createRequest('POST', { label: '스냅샷' }), mockParams)
    expect(response.status).toBe(404)
  })
})

describe('DELETE /api/projects/[id]/snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockCheckOwnership.mockReturnValue(null)
    mockFindUnique.mockResolvedValue({ userId: 'user-1' })
  })

  it('성공 시 200을 반환한다', async () => {
    ;(prisma.projectSnapshot.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({})

    const response = await DELETE(createRequest('DELETE', { snapshotId: 'snap-1' }), mockParams)
    expect(response.status).toBe(200)
  })
})
