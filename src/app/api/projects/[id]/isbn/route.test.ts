import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    iSBN: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/isbn', () => ({
  validateAndParseISBN: vi.fn(),
  formatISBN: vi.fn().mockReturnValue('978-89-1234-567-8'),
}))

vi.mock('@/lib/api-utils', () => ({
  handleApiError: vi.fn().mockReturnValue(
    NextResponse.json({ error: 'Internal error' }, { status: 500 }),
  ),
}))

import { GET, POST, DELETE } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/client'
import { validateAndParseISBN } from '@/lib/isbn'

const mockRequireAuth = vi.mocked(requireAuth)
const mockFindUnique = prisma.iSBN.findUnique as unknown as ReturnType<typeof vi.fn>
const mockUpsert = prisma.iSBN.upsert as unknown as ReturnType<typeof vi.fn>
const mockISBNDelete = prisma.iSBN.delete as unknown as ReturnType<typeof vi.fn>
const mockValidate = vi.mocked(validateAndParseISBN)

const mockParams = { params: Promise.resolve({ id: 'proj-1' }) }

function createRequest(method: string, body?: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/projects/proj-1/isbn', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  })
}

const mockISBN = {
  id: 'isbn-1',
  projectId: 'proj-1',
  isbn13: '9788912345678',
  isbn10: null,
  checkDigit: '8',
  prefix: '978',
  groupCode: '89',
  registrant: '1234',
  publication: '567',
  barcodeUrl: null,
  isValid: true,
  assignedAt: new Date(),
  status: 'draft',
  appliedAt: null,
  issuedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('GET /api/projects/[id]/isbn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('ISBN이 있으면 200과 데이터를 반환한다', async () => {
    mockFindUnique.mockResolvedValue(mockISBN)

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.isbn13).toBe('9788912345678')
  })

  it('ISBN이 없으면 data: null을 반환한다', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await GET(createRequest('GET'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toBeNull()
  })
})

describe('POST /api/projects/[id]/isbn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 200과 ISBN 데이터를 반환한다', async () => {
    mockValidate.mockReturnValue({
      isValid: true,
      isbn13: '9788912345678',
      isbn10: null,
      components: {
        prefix: '978',
        groupCode: '89',
        registrant: '1234',
        publication: '567',
        checkDigit: '8',
      },
    } as never)
    mockUpsert.mockResolvedValue(mockISBN)

    const response = await POST(createRequest('POST', {
      isbn: '9788912345678',
    }), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })

  it('유효하지 않은 ISBN이면 400을 반환한다', async () => {
    mockValidate.mockReturnValue({
      isValid: false,
      error: '유효하지 않은 ISBN',
    } as never)

    const response = await POST(createRequest('POST', {
      isbn: 'invalid',
    }), mockParams)
    expect(response.status).toBe(400)
  })
})

describe('DELETE /api/projects/[id]/isbn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 200을 반환한다', async () => {
    mockISBNDelete.mockResolvedValue(mockISBN)

    const response = await DELETE(createRequest('DELETE'), mockParams)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
