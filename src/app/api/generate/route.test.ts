import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', error: null }),
}))

vi.mock('@/agents/research', () => ({
  runResearchAgent: vi.fn(),
}))

vi.mock('@/agents/outliner', () => ({
  runOutlinerAgent: vi.fn(),
  refineOutline: vi.fn(),
  generateTableOfContents: vi.fn().mockReturnValue({ chapters: [] }),
}))

vi.mock('@/agents/writer', () => ({
  runWriterAgentWithUsage: vi.fn(),
}))

vi.mock('@/agents/editor', () => ({
  runEditorAgent: vi.fn(),
}))

vi.mock('@/agents/critic', () => ({
  runCriticAgent: vi.fn(),
}))

vi.mock('@/agents/editor-critic', () => ({
  runEditorCriticLoop: vi.fn(),
  runSinglePassEditorCritic: vi.fn(),
}))

vi.mock('@/lib/token-quota', () => ({
  checkQuota: vi.fn(),
  recordUsage: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/api-utils', () => ({
  handleApiError: vi.fn().mockReturnValue(
    NextResponse.json({ error: 'Internal error' }, { status: 500 }),
  ),
}))

import { POST } from './route'
import { requireAuth } from '@/lib/auth/auth-utils'
import { runResearchAgent } from '@/agents/research'
import { runOutlinerAgent, generateTableOfContents } from '@/agents/outliner'
import { runWriterAgentWithUsage } from '@/agents/writer'
import { runEditorAgent } from '@/agents/editor'
import { runCriticAgent } from '@/agents/critic'
import { runSinglePassEditorCritic } from '@/agents/editor-critic'
import { checkQuota } from '@/lib/token-quota'

const mockRequireAuth = vi.mocked(requireAuth)
const mockCheckQuota = vi.mocked(checkQuota)

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/generate', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue({ userId: 'user-1', error: null })
    mockCheckQuota.mockResolvedValue(undefined)
  })

  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: '로그인 필요' }, { status: 401 }),
    })

    const response = await POST(createRequest({ phase: 'research' }))
    expect(response.status).toBe(401)
  })

  it('잘못된 phase 시 400을 반환한다', async () => {
    const response = await POST(createRequest({ phase: 'invalid' }))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Invalid phase')
  })

  it('quota 초과 시 에러를 반환한다', async () => {
    const { AppError, ERROR_CODES } = await import('@/lib/errors')
    mockCheckQuota.mockRejectedValue(new AppError(ERROR_CODES.QUOTA_EXCEEDED))

    const response = await POST(createRequest({ phase: 'research' }))
    expect(response.status).toBe(500)
  })

  it('research phase 성공', async () => {
    vi.mocked(runResearchAgent).mockResolvedValue({ _usage: { inputTokens: 10, outputTokens: 20 } } as never)

    const response = await POST(createRequest({
      phase: 'research',
      bookType: 'fiction',
      title: '테스트',
      description: '설명',
    }))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.research).toBeDefined()
  })

  it('outline phase 성공', async () => {
    vi.mocked(runOutlinerAgent).mockResolvedValue({ _usage: { inputTokens: 10, outputTokens: 20 } } as never)
    vi.mocked(generateTableOfContents).mockReturnValue({ chapters: [] } as never)

    const response = await POST(createRequest({
      phase: 'outline',
      bookType: 'fiction',
      title: '테스트',
      description: '설명',
      research: {},
    }))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.outline).toBeDefined()
    expect(body.toc).toBeDefined()
  })

  it('write phase 성공', async () => {
    vi.mocked(runWriterAgentWithUsage).mockResolvedValue({
      text: '작성된 내용',
      usage: { inputTokens: 10, outputTokens: 20 },
    })

    const response = await POST(createRequest({
      phase: 'write',
      bookType: 'fiction',
      outline: {},
      chapter: { number: 1 },
    }))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.content).toBe('작성된 내용')
  })

  it('edit phase 성공', async () => {
    vi.mocked(runEditorAgent).mockResolvedValue({
      editedContent: '편집됨',
      _usage: { inputTokens: 10, outputTokens: 20 },
    } as never)

    const response = await POST(createRequest({
      phase: 'edit',
      content: '원본',
      chapterTitle: '제목',
      tone: '친근체',
    }))
    expect(response.status).toBe(200)
  })

  it('critic phase 성공', async () => {
    vi.mocked(runCriticAgent).mockResolvedValue({
      verdict: 'pass',
      _usage: { inputTokens: 10, outputTokens: 20 },
    } as never)

    const response = await POST(createRequest({
      phase: 'critic',
      content: '원본',
      chapterTitle: '제목',
      targetAudience: '일반',
      tone: '친근체',
    }))
    expect(response.status).toBe(200)
  })

  it('editor-critic phase (single pass) 성공', async () => {
    vi.mocked(runSinglePassEditorCritic).mockResolvedValue({
      result: 'done',
      _usage: { inputTokens: 10, outputTokens: 20 },
    } as never)

    const response = await POST(createRequest({
      phase: 'editor-critic',
      content: '원본',
      chapterTitle: '제목',
      targetAudience: '일반',
      tone: '친근체',
    }))
    expect(response.status).toBe(200)
  })

  it('toc phase 성공', async () => {
    vi.mocked(generateTableOfContents).mockReturnValue({ chapters: [] } as never)

    const response = await POST(createRequest({
      phase: 'toc',
      title: '제목',
      outline: {},
    }))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.toc).toBeDefined()
  })
})
