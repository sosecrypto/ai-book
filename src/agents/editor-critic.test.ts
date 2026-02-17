import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/claude', () => ({
  runAgent: vi.fn(),
}))

import {
  runEditorCriticAgent,
  runEditorCriticLoop,
  runSinglePassEditorCritic,
} from './editor-critic'
import { runAgent } from '@/lib/claude'

const mockRunAgent = vi.mocked(runAgent)

function createMockEditorCriticResponse(
  decision: 'pass' | 'revise' = 'pass',
  overallScore = 8
) {
  return JSON.stringify({
    editedContent: '교정된 내용',
    grammarCheck: {
      totalErrors: 2,
      errorsByCategory: {
        spelling: 1,
        grammar: 1,
        punctuation: 0,
        word_choice: 0,
        sentence_flow: 0,
        style: 0,
      },
      corrections: [
        {
          location: '1문단',
          original: '오류',
          corrected: '수정',
          category: 'spelling',
          severity: 'minor',
          reason: '맞춤법',
        },
      ],
    },
    qualityEvaluation: {
      decision,
      overallScore,
      scores: {
        grammar: overallScore,
        clarity: overallScore,
        coherence: overallScore,
        engagement: overallScore,
        targetFit: overallScore,
      },
      strengths: ['좋은 구성'],
      weaknesses: decision === 'revise' ? ['개선 필요'] : [],
      priorityRevisions: decision === 'revise' ? ['수정 사항'] : [],
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('runEditorCriticAgent', () => {
  it('JSON 응답을 파싱한다', async () => {
    mockRunAgent.mockResolvedValue(createMockEditorCriticResponse())

    const result = await runEditorCriticAgent('내용', '제목', '독자', '톤')

    expect(result.editedContent).toBe('교정된 내용')
    expect(result.grammarCheck.totalErrors).toBe(2)
    expect(result.qualityEvaluation.decision).toBe('pass')
    expect(result.qualityEvaluation.overallScore).toBe(8)
  })

  it('코드 블록 안의 JSON을 파싱한다', async () => {
    const json = createMockEditorCriticResponse()
    mockRunAgent.mockResolvedValue(`\`\`\`json\n${json}\n\`\`\``)

    const result = await runEditorCriticAgent('내용', '제목', '독자', '톤')
    expect(result.editedContent).toBe('교정된 내용')
  })

  it('파싱 실패 시 기본 결과를 반환한다', async () => {
    mockRunAgent.mockResolvedValue('파싱 불가 텍스트')

    const result = await runEditorCriticAgent('원본 내용', '제목', '독자', '톤')

    expect(result.editedContent).toBe('원본 내용')
    expect(result.grammarCheck.totalErrors).toBe(0)
    expect(result.qualityEvaluation.decision).toBe('pass')
    expect(result.qualityEvaluation.overallScore).toBe(7)
  })

  it('부분적 응답에 기본값을 채운다', async () => {
    mockRunAgent.mockResolvedValue(
      JSON.stringify({ editedContent: '내용만 있음' })
    )

    const result = await runEditorCriticAgent('내용', '제목', '독자', '톤')
    expect(result.editedContent).toBe('내용만 있음')
    expect(result.grammarCheck.totalErrors).toBe(0)
    expect(result.qualityEvaluation.overallScore).toBe(5)
  })
})

describe('runEditorCriticLoop', () => {
  it('첫 반복에서 pass하면 즉시 반환한다', async () => {
    mockRunAgent.mockResolvedValue(createMockEditorCriticResponse('pass', 8))

    const result = await runEditorCriticLoop('내용', '제목', '독자', '톤')

    expect(result.iterationCount).toBe(1)
    expect(result.finalStatus).toBe('passed')
    expect(mockRunAgent).toHaveBeenCalledTimes(1)
  })

  it('revise 후 최대 반복에 도달하면 max_iterations_reached를 반환한다', async () => {
    // 항상 revise 반환
    mockRunAgent.mockResolvedValue(
      createMockEditorCriticResponse('revise', 5)
    )

    const result = await runEditorCriticLoop('내용', '제목', '독자', '톤', {
      maxIterations: 2,
    })

    expect(result.finalStatus).toBe('max_iterations_reached')
    expect(result.iterationCount).toBe(2)
    // editorCritic 2번 + revision 1번(마지막 반복에서는 revision 안함) = 3번
    expect(mockRunAgent).toHaveBeenCalledTimes(3)
  })

  it('onIteration 콜백을 호출한다', async () => {
    mockRunAgent.mockResolvedValue(createMockEditorCriticResponse('pass', 8))
    const onIteration = vi.fn()

    await runEditorCriticLoop('내용', '제목', '독자', '톤', { onIteration })

    expect(onIteration).toHaveBeenCalledWith(1, expect.objectContaining({
      iterationCount: 1,
    }))
  })

  it('기본 maxIterations는 3이다', async () => {
    mockRunAgent.mockResolvedValue(
      createMockEditorCriticResponse('revise', 5)
    )

    const result = await runEditorCriticLoop('내용', '제목', '독자', '톤')

    expect(result.iterationCount).toBe(3)
  })

  it('passThreshold를 커스터마이즈할 수 있다', async () => {
    // score 8이지만 threshold 9이므로 pass 안됨
    mockRunAgent.mockResolvedValue(
      createMockEditorCriticResponse('pass', 8)
    )

    const result = await runEditorCriticLoop('내용', '제목', '독자', '톤', {
      maxIterations: 1,
      passThreshold: 9,
    })

    expect(result.finalStatus).toBe('max_iterations_reached')
  })

  it('두 번째 반복에서 pass하면 종료한다', async () => {
    mockRunAgent
      .mockResolvedValueOnce(createMockEditorCriticResponse('revise', 5))
      .mockResolvedValueOnce('수정된 내용') // revision
      .mockResolvedValueOnce(createMockEditorCriticResponse('pass', 8))

    const result = await runEditorCriticLoop('내용', '제목', '독자', '톤')

    expect(result.iterationCount).toBe(2)
    expect(result.finalStatus).toBe('passed')
  })
})

describe('runSinglePassEditorCritic', () => {
  it('단일 패스를 실행하고 single_pass 상태를 반환한다', async () => {
    mockRunAgent.mockResolvedValue(createMockEditorCriticResponse('pass', 8))

    const result = await runSinglePassEditorCritic('내용', '제목', '독자', '톤')

    expect(result.iterationCount).toBe(1)
    expect(result.finalStatus).toBe('single_pass')
    expect(result.editedContent).toBe('교정된 내용')
  })

  it('파싱 실패 시에도 single_pass 상태를 반환한다', async () => {
    mockRunAgent.mockResolvedValue('파싱 불가')

    const result = await runSinglePassEditorCritic('원본', '제목', '독자', '톤')

    expect(result.finalStatus).toBe('single_pass')
    expect(result.editedContent).toBe('원본')
  })
})
