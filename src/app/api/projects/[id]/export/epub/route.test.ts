import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    project: { findUnique: vi.fn() },
  },
}))

vi.mock('@/lib/epub', () => ({
  generateEPUB: vi.fn().mockResolvedValue(Buffer.from('epub-content')),
}))

vi.mock('@/lib/api-utils', () => ({
  handleApiError: vi.fn().mockReturnValue(
    NextResponse.json({ error: 'Internal error' }, { status: 500 }),
  ),
}))

import { POST, GET } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/client'

const mockRequireAuth = vi.mocked(requireAuth)
const mockFindUnique = prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>

const mockParams = { params: Promise.resolve({ id: 'proj-1' }) }

const mockProject = {
  id: 'proj-1',
  title: '테스트',
  type: 'fiction',
  description: '설명',
  outline: null,
  status: 'draft',
  stage: 'write',
  targetAudience: null,
  targetLength: null,
  tone: null,
  confirmedAt: null,
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  chapters: [
    { id: 'ch-1', number: 1, title: '챕터1', content: '내용', status: 'draft' },
  ],
  bookMetadata: null,
}

function createRequest(method: string, body?: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/projects/proj-1/export/epub', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  })
}

describe('POST /api/projects/[id]/export/epub', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 EPUB 바이너리를 반환한다', async () => {
    mockFindUnique.mockResolvedValue(mockProject)

    const response = await POST(createRequest('POST', {}), mockParams)
    expect(response.headers.get('Content-Type')).toBe('application/epub+zip')
  })

  it('프로젝트 없으면 404를 반환한다', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await POST(createRequest('POST', {}), mockParams)
    expect(response.status).toBe(404)
  })

  it('챕터 없으면 400을 반환한다', async () => {
    mockFindUnique.mockResolvedValue({ ...mockProject, chapters: [] })

    const response = await POST(createRequest('POST', {}), mockParams)
    expect(response.status).toBe(400)
  })
})

describe('GET /api/projects/[id]/export/epub', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('프로젝트 정보를 반환한다', async () => {
    mockFindUnique.mockResolvedValue(mockProject)

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.chapterCount).toBe(1)
    expect(body.data.canExport).toBe(true)
  })

  it('프로젝트 없으면 404를 반환한다', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(404)
  })
})
