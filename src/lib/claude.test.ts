import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCreate, mockStream } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockStream: vi.fn(),
}))

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: mockCreate,
        stream: mockStream,
      }
    },
  }
})

import { runAgent, streamAgent, streamAgentWithHistory, withRetry } from './claude'
import type { AgentConfig } from './claude'

const testConfig: AgentConfig = {
  name: 'Test Agent',
  systemPrompt: 'You are a test agent.',
  temperature: 0.5,
  maxTokens: 1000,
}

describe('runAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('텍스트 응답을 반환한다', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Hello response' }],
    })

    const result = await runAgent(testConfig, 'Hello')
    expect(result).toBe('Hello response')
  })

  it('텍스트 블록이 없으면 빈 문자열을 반환한다', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'tool_use', id: '1', name: 'test', input: {} }],
    })

    const result = await runAgent(testConfig, 'Hello')
    expect(result).toBe('')
  })

  it('context가 있으면 systemPrompt에 추가한다', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'ok' }],
    })

    await runAgent(testConfig, 'Hello', 'some context')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('some context'),
      })
    )
  })

  it('기본 maxTokens와 temperature를 사용한다', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'ok' }],
    })

    const minConfig: AgentConfig = {
      name: 'Min',
      systemPrompt: 'test',
    }
    await runAgent(minConfig, 'Hello')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        max_tokens: 8192,
        temperature: 0.7,
      })
    )
  })
})

describe('streamAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('스트리밍 응답을 합쳐서 반환한다', async () => {
    const mockIterator = {
      [Symbol.asyncIterator]: async function* () {
        yield {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Hello ' },
        }
        yield {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'World' },
        }
        yield { type: 'message_stop' }
      },
    }
    mockStream.mockReturnValue(mockIterator)

    const result = await streamAgent(testConfig, 'Hi')
    expect(result).toBe('Hello World')
  })

  it('onChunk 콜백을 호출한다', async () => {
    const onChunk = vi.fn()

    const mockIterator = {
      [Symbol.asyncIterator]: async function* () {
        yield {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'chunk1' },
        }
        yield {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'chunk2' },
        }
      },
    }
    mockStream.mockReturnValue(mockIterator)

    await streamAgent(testConfig, 'Hi', undefined, onChunk)
    expect(onChunk).toHaveBeenCalledWith('chunk1')
    expect(onChunk).toHaveBeenCalledWith('chunk2')
  })

  it('context가 있으면 systemPrompt에 추가한다', async () => {
    mockStream.mockReturnValue({
      [Symbol.asyncIterator]: async function* () {},
    })

    await streamAgent(testConfig, 'Hi', 'ctx')
    expect(mockStream).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('ctx'),
      })
    )
  })
})

describe('streamAgentWithHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('messages 배열을 전달한다', async () => {
    mockStream.mockReturnValue({
      [Symbol.asyncIterator]: async function* () {
        yield {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'response' },
        }
      },
    })

    const messages = [
      { role: 'user' as const, content: 'Hi' },
      { role: 'assistant' as const, content: 'Hello' },
      { role: 'user' as const, content: 'How are you?' },
    ]

    const result = await streamAgentWithHistory(testConfig, messages)
    expect(result).toBe('response')
    expect(mockStream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages,
      })
    )
  })
})

// withRetry tests use a patched version with 0 delay for fast testing
describe('withRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 즉시 결과를 반환한다', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await withRetry(fn, 0)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retryable 에러 시 재시도 후 성공한다', async () => {
    const apiError = Object.assign(new Error('Rate limited'), { status: 429 })
    const fn = vi.fn()
      .mockRejectedValueOnce(apiError)
      .mockResolvedValueOnce('success')

    const result = await withRetry(fn, 1)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('최대 재시도 횟수 초과 시 에러를 던진다', async () => {
    const apiError = Object.assign(new Error('Server error'), { status: 500 })
    const fn = vi.fn().mockRejectedValue(apiError)

    await expect(withRetry(fn, 0)).rejects.toThrow('Server error')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('non-retryable 에러는 즉시 실패한다', async () => {
    const apiError = Object.assign(new Error('Bad request'), { status: 400 })
    const fn = vi.fn().mockRejectedValue(apiError)

    await expect(withRetry(fn, 3)).rejects.toThrow('Bad request')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
