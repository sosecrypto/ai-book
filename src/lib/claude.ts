import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

const anthropic = new Anthropic()

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 529])
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

function isRetryableError(error: unknown): boolean {
  // Check for API errors with status code (works with both real and mocked Anthropic)
  if (error && typeof error === 'object' && 'status' in error && typeof (error as { status: unknown }).status === 'number') {
    return RETRYABLE_STATUS_CODES.has((error as { status: number }).status)
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return message.includes('network') || message.includes('econnreset') || message.includes('fetch failed')
  }
  return false
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error
      }

      const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

export interface AgentConfig {
  name: string
  systemPrompt: string
  temperature?: number
  maxTokens?: number
}

export type { MessageParam }

export async function runAgent(
  config: AgentConfig,
  userMessage: string,
  context?: string
): Promise<string> {
  const systemPrompt = context
    ? `${config.systemPrompt}\n\n## Current Context:\n${context}`
    : config.systemPrompt

  const message = await withRetry(() =>
    anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: config.maxTokens ?? 8192,
      temperature: config.temperature ?? 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ],
    })
  )

  const textBlock = message.content.find(block => block.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text : ''
}

export async function streamAgent(
  config: AgentConfig,
  userMessage: string,
  context?: string,
  onChunk: (chunk: string) => void = () => {}
): Promise<string> {
  const systemPrompt = context
    ? `${config.systemPrompt}\n\n## Current Context:\n${context}`
    : config.systemPrompt

  return withRetry(async () => {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: config.maxTokens ?? 8192,
      temperature: config.temperature ?? 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ],
    })

    let fullResponse = ''

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = event.delta.text
        fullResponse += chunk
        onChunk(chunk)
      }
    }

    return fullResponse
  })
}

/**
 * 대화 히스토리를 포함한 스트리밍 에이전트 호출
 * @param config 에이전트 설정
 * @param messages 전체 대화 히스토리 (user/assistant 번갈아가며)
 * @param onChunk 스트리밍 청크 콜백
 */
export async function streamAgentWithHistory(
  config: AgentConfig,
  messages: MessageParam[],
  onChunk: (chunk: string) => void = () => {}
): Promise<string> {
  return withRetry(async () => {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: config.maxTokens ?? 8192,
      temperature: config.temperature ?? 0.7,
      system: config.systemPrompt,
      messages,
    })

    let fullResponse = ''

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = event.delta.text
        fullResponse += chunk
        onChunk(chunk)
      }
    }

    return fullResponse
  })
}
