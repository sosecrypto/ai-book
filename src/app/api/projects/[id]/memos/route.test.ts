import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    memo: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/api-utils', () => ({
  handleApiError: vi.fn().mockReturnValue(
    NextResponse.json({ error: 'Internal error' }, { status: 500 }),
  ),
}))

import { GET, POST, PATCH, DELETE } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/client'

const mockRequireAuth = vi.mocked(requireAuth)
const mockFindMany = prisma.memo.findMany as unknown as ReturnType<typeof vi.fn>
const mockFindFirst = prisma.memo.findFirst as unknown as ReturnType<typeof vi.fn>
const mockCreate = prisma.memo.create as unknown as ReturnType<typeof vi.fn>
const mockMemoUpdate = prisma.memo.update as unknown as ReturnType<typeof vi.fn>
const mockMemoDelete = prisma.memo.delete as unknown as ReturnType<typeof vi.fn>

const mockParams = { params: Promise.resolve({ id: 'proj-1' }) }

const mockMemo = {
  id: 'memo-1',
  projectId: 'proj-1',
  content: '메모 내용',
  chapterNumber: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function createRequest(method: string, url?: string, body?: Record<string, unknown>): NextRequest {
  const finalUrl = url || 'http://localhost:3000/api/projects/proj-1/memos'
  return new NextRequest(finalUrl, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  })
}

describe('GET /api/projects/[id]/memos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 200과 메모 목록을 반환한다', async () => {
    mockFindMany.mockResolvedValue([mockMemo])

    const response = await GET(
      createRequest('GET'),
      mockParams,
    )
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

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(401)
  })
})

describe('POST /api/projects/[id]/memos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 201과 생성된 메모를 반환한다', async () => {
    mockCreate.mockResolvedValue(mockMemo)

    const response = await POST(
      createRequest('POST', undefined, { content: '새 메모' }),
      mockParams,
    )
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.success).toBe(true)
  })

  it('content 누락 시 400을 반환한다', async () => {
    const response = await POST(
      createRequest('POST', undefined, {}),
      mockParams,
    )
    expect(response.status).toBe(400)
  })
})

describe('PATCH /api/projects/[id]/memos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 200과 수정된 메모를 반환한다', async () => {
    mockFindFirst.mockResolvedValue(mockMemo)
    mockMemoUpdate.mockResolvedValue({ ...mockMemo, content: '수정됨' })

    const response = await PATCH(
      createRequest('PATCH', undefined, { memoId: 'memo-1', content: '수정됨' }),
      mockParams,
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.content).toBe('수정됨')
  })

  it('memoId 누락 시 400을 반환한다', async () => {
    const response = await PATCH(
      createRequest('PATCH', undefined, { content: '수정' }),
      mockParams,
    )
    expect(response.status).toBe(400)
  })

  it('메모 없으면 404를 반환한다', async () => {
    mockFindFirst.mockResolvedValue(null)

    const response = await PATCH(
      createRequest('PATCH', undefined, { memoId: 'nonexistent', content: '수정' }),
      mockParams,
    )
    expect(response.status).toBe(404)
  })
})

describe('DELETE /api/projects/[id]/memos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 200을 반환한다', async () => {
    mockFindFirst.mockResolvedValue(mockMemo)
    mockMemoDelete.mockResolvedValue(mockMemo)

    const response = await DELETE(
      createRequest('DELETE', 'http://localhost:3000/api/projects/proj-1/memos?memoId=memo-1'),
      mockParams,
    )
    expect(response.status).toBe(200)
  })

  it('memoId 누락 시 400을 반환한다', async () => {
    const response = await DELETE(
      createRequest('DELETE'),
      mockParams,
    )
    expect(response.status).toBe(400)
  })

  it('메모 없으면 404를 반환한다', async () => {
    mockFindFirst.mockResolvedValue(null)

    const response = await DELETE(
      createRequest('DELETE', 'http://localhost:3000/api/projects/proj-1/memos?memoId=nonexistent'),
      mockParams,
    )
    expect(response.status).toBe(404)
  })
})
