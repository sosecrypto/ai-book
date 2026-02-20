import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/lib/file-parser', () => ({
  parseBuffer: vi.fn(),
  FileParseError: class FileParseError extends Error {
    constructor(msg: string) { super(msg); this.name = 'FileParseError' }
  },
}))

vi.mock('@/lib/api-utils', () => ({
  handleApiError: vi.fn().mockReturnValue(
    NextResponse.json({ error: 'Internal error' }, { status: 500 }),
  ),
}))

import { POST } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { parseBuffer } from '@/lib/file-parser'

const mockRequireAuth = vi.mocked(requireAuth)
const mockParseBuffer = vi.mocked(parseBuffer)

function createUploadRequest(file?: { name: string; type: string; size?: number }): NextRequest {
  const req = new NextRequest('http://localhost:3000/api/upload', { method: 'POST' })

  let mockFile: Record<string, unknown> | null = null
  if (file) {
    mockFile = {
      name: file.name,
      type: file.type,
      size: file.size ?? 100,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    }
  }

  const mockFormData = {
    get: vi.fn().mockReturnValue(mockFile),
  }

  Object.defineProperty(req, 'formData', {
    value: vi.fn().mockResolvedValue(mockFormData),
  })
  return req
}

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('성공 시 200과 파싱 결과를 반환한다', async () => {
    mockParseBuffer.mockResolvedValue({
      content: '파싱된 내용',
      fileName: 'test.txt',
      fileType: 'txt',
      fileSize: 100,
    } as never)

    const request = createUploadRequest({ name: 'test.txt', type: 'text/plain' })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.content).toBe('파싱된 내용')
  })

  it('파일 없으면 400을 반환한다', async () => {
    const request = createUploadRequest()
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('지원하지 않는 확장자면 400을 반환한다', async () => {
    const request = createUploadRequest({ name: 'test.exe', type: 'application/octet-stream' })
    const response = await POST(request)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain('지원하지 않는')
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: '로그인 필요' }, { status: 401 }),
    })

    const request = createUploadRequest({ name: 'test.txt', type: 'text/plain' })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('50MB 초과 파일은 400을 반환한다', async () => {
    const request = createUploadRequest({
      name: 'large.txt',
      type: 'text/plain',
      size: 51 * 1024 * 1024,
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain('50MB')
  })
})
