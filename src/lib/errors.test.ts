import { describe, it, expect } from 'vitest'
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  AppError,
  getErrorCode,
  getErrorMessage,
} from './errors'

describe('ERROR_CODES', () => {
  it('모든 에러 코드가 정의되어 있어야 한다', () => {
    expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR')
    expect(ERROR_CODES.AI_RATE_LIMIT).toBe('AI_RATE_LIMIT')
    expect(ERROR_CODES.AI_CONTEXT_TOO_LONG).toBe('AI_CONTEXT_TOO_LONG')
    expect(ERROR_CODES.AI_GENERATION_CANCELLED).toBe('AI_GENERATION_CANCELLED')
    expect(ERROR_CODES.SAVE_FAILED).toBe('SAVE_FAILED')
    expect(ERROR_CODES.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR')
  })
})

describe('ERROR_MESSAGES', () => {
  it('모든 에러 코드에 대한 메시지가 있어야 한다', () => {
    for (const code of Object.values(ERROR_CODES)) {
      expect(ERROR_MESSAGES[code]).toBeDefined()
      expect(typeof ERROR_MESSAGES[code]).toBe('string')
    }
  })
})

describe('AppError', () => {
  it('코드와 기본 메시지로 생성된다', () => {
    const error = new AppError(ERROR_CODES.NETWORK_ERROR)
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.message).toBe(ERROR_MESSAGES.NETWORK_ERROR)
    expect(error.name).toBe('AppError')
    expect(error).toBeInstanceOf(Error)
  })

  it('커스텀 메시지로 생성된다', () => {
    const error = new AppError(ERROR_CODES.SAVE_FAILED, '커스텀 메시지')
    expect(error.code).toBe('SAVE_FAILED')
    expect(error.message).toBe('커스텀 메시지')
  })
})

describe('getErrorCode', () => {
  it('AppError에서 코드를 반환한다', () => {
    const error = new AppError(ERROR_CODES.AI_RATE_LIMIT)
    expect(getErrorCode(error)).toBe('AI_RATE_LIMIT')
  })

  it('AbortError를 감지한다', () => {
    const error = new Error('The operation was aborted')
    error.name = 'AbortError'
    expect(getErrorCode(error)).toBe('AI_GENERATION_CANCELLED')
  })

  it('abort 메시지를 감지한다', () => {
    expect(getErrorCode(new Error('request was aborted'))).toBe(
      'AI_GENERATION_CANCELLED'
    )
  })

  it('network 에러를 감지한다', () => {
    expect(getErrorCode(new Error('network error occurred'))).toBe(
      'NETWORK_ERROR'
    )
  })

  it('fetch 에러를 감지한다', () => {
    expect(getErrorCode(new Error('fetch failed'))).toBe('NETWORK_ERROR')
  })

  it('rate limit 에러를 감지한다', () => {
    expect(getErrorCode(new Error('rate limit exceeded'))).toBe(
      'AI_RATE_LIMIT'
    )
  })

  it('429 에러를 감지한다', () => {
    expect(getErrorCode(new Error('Error 429: too many requests'))).toBe(
      'AI_RATE_LIMIT'
    )
  })

  it('context too long 에러를 감지한다', () => {
    expect(getErrorCode(new Error('context too long'))).toBe(
      'AI_CONTEXT_TOO_LONG'
    )
  })

  it('too long 에러를 감지한다', () => {
    expect(getErrorCode(new Error('input is too long'))).toBe(
      'AI_CONTEXT_TOO_LONG'
    )
  })

  it('알 수 없는 Error 객체에 UNKNOWN_ERROR를 반환한다', () => {
    expect(getErrorCode(new Error('some random error'))).toBe('UNKNOWN_ERROR')
  })

  it('Error가 아닌 값에 UNKNOWN_ERROR를 반환한다', () => {
    expect(getErrorCode('string error')).toBe('UNKNOWN_ERROR')
    expect(getErrorCode(null)).toBe('UNKNOWN_ERROR')
    expect(getErrorCode(undefined)).toBe('UNKNOWN_ERROR')
    expect(getErrorCode(42)).toBe('UNKNOWN_ERROR')
  })
})

describe('getErrorMessage', () => {
  it('AppError의 메시지를 반환한다', () => {
    const error = new AppError(ERROR_CODES.NETWORK_ERROR)
    expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.NETWORK_ERROR)
  })

  it('network 에러 메시지를 반환한다', () => {
    expect(getErrorMessage(new Error('network error'))).toBe(
      ERROR_MESSAGES.NETWORK_ERROR
    )
  })

  it('알 수 없는 에러에 기본 메시지를 반환한다', () => {
    expect(getErrorMessage('unknown')).toBe(ERROR_MESSAGES.UNKNOWN_ERROR)
  })
})
