import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/api-utils', () => ({
  handleApiError: vi.fn().mockReturnValue(
    NextResponse.json({ error: 'Internal error' }, { status: 500 }),
  ),
}))

vi.mock('@/types/book-bible', () => ({
  createEmptyBible: vi.fn().mockReturnValue({ type: 'fiction', characters: [], worldSettings: [] }),
}))

import { GET, PUT } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/client'

const mockRequireAuth = vi.mocked(requireAuth)
const mockFindUnique = prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>
const mockUpdate = prisma.project.update as unknown as ReturnType<typeof vi.fn>

const mockParams = { params: Promise.resolve({ id: 'proj-1' }) }

function createRequest(method: string, body?: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/projects/proj-1/bible', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  })
}

describe('GET /api/projects/[id]/bible', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('bible이 있으면 200과 파싱된 데이터를 반환한다', async () => {
    const bible = { type: 'fiction', characters: [] }
    mockFindUnique.mockResolvedValue({
      id: 'proj-1',
      type: 'fiction',
      bible: JSON.stringify(bible),
    })

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.type).toBe('fiction')
  })

  it('bible이 없으면 빈 bible을 반환한다', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'proj-1',
      type: 'fiction',
      bible: null,
    })

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toBeDefined()
  })

  it('프로젝트가 없으면 404를 반환한다', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(404)
  })
})

describe('PUT /api/projects/[id]/bible', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockUpdate.mockResolvedValue({})
  })

  it('성공 시 200과 업데이트된 bible을 반환한다', async () => {
    mockFindUnique.mockResolvedValue({ id: 'proj-1' })

    const response = await PUT(createRequest('PUT', {
      type: 'fiction',
      characters: [],
      worldSettings: [],
    }), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })

  it('잘못된 형식이면 400을 반환한다', async () => {
    const response = await PUT(createRequest('PUT', {
      type: 'invalid',
    }), mockParams)
    expect(response.status).toBe(400)
  })

  it('프로젝트가 없으면 404를 반환한다', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await PUT(createRequest('PUT', {
      type: 'fiction',
    }), mockParams)
    expect(response.status).toBe(404)
  })
})
