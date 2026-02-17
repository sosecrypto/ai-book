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

import { runAgent, streamAgent, streamAgentWithHistory } from './claude'
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
    mockStream.mockResolvedValue(mockIterator)

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
    mockStream.mockResolvedValue(mockIterator)

    await streamAgent(testConfig, 'Hi', undefined, onChunk)
    expect(onChunk).toHaveBeenCalledWith('chunk1')
    expect(onChunk).toHaveBeenCalledWith('chunk2')
  })

  it('context가 있으면 systemPrompt에 추가한다', async () => {
    mockStream.mockResolvedValue({
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
    mockStream.mockResolvedValue({
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
