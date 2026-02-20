import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    bookMetadata: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/api-utils', () => ({
  handleApiError: vi.fn().mockReturnValue(
    NextResponse.json({ error: 'Internal error' }, { status: 500 }),
  ),
}))

import { GET, POST, DELETE } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/client'

const mockRequireAuth = vi.mocked(requireAuth)
const mockFindUnique = prisma.bookMetadata.findUnique as unknown as ReturnType<typeof vi.fn>
const mockUpsert = prisma.bookMetadata.upsert as unknown as ReturnType<typeof vi.fn>
const mockMetadataDelete = prisma.bookMetadata.delete as unknown as ReturnType<typeof vi.fn>

const mockParams = { params: Promise.resolve({ id: 'proj-1' }) }

const mockMetadata = {
  id: 'meta-1',
  projectId: 'proj-1',
  subtitle: '부제',
  authors: '[]',
  publisher: '출판사',
  publisherAddress: null,
  publishDate: null,
  edition: null,
  printRun: null,
  categories: '[]',
  keywords: '[]',
  language: 'ko',
  copyright: null,
  license: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function createRequest(method: string, body?: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/projects/proj-1/metadata', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  })
}

describe('GET /api/projects/[id]/metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('메타데이터가 있으면 200과 데이터를 반환한다', async () => {
    mockFindUnique.mockResolvedValue(mockMetadata)

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.projectId).toBe('proj-1')
  })

  it('메타데이터가 없으면 data: null을 반환한다', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toBeNull()
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: '로그인 필요' }, { status: 401 }),
    })

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(401)
  })
})

describe('POST /api/projects/[id]/metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 200과 upsert된 메타데이터를 반환한다', async () => {
    mockUpsert.mockResolvedValue(mockMetadata)

    const response = await POST(createRequest('POST', {
      subtitle: '부제',
      publisher: '출판사',
    }), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: '로그인 필요' }, { status: 401 }),
    })

    const response = await POST(createRequest('POST', {}), mockParams)
    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/projects/[id]/metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 200을 반환한다', async () => {
    mockMetadataDelete.mockResolvedValue(mockMetadata)

    const response = await DELETE(createRequest('DELETE'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
