import { describe, it, expect } from 'vitest'
import { parseJSONFromText, AI_CONTENT_LIMITS } from './json-parser'

describe('parseJSONFromText', () => {
  it('순수 JSON을 파싱한다', () => {
    const result = parseJSONFromText('{"key": "value"}', {})
    expect(result).toEqual({ key: 'value' })
  })

  it('텍스트와 섞인 JSON을 추출한다', () => {
    const text = '여기 결과입니다:\n{"name": "test", "count": 5}\n위와 같습니다.'
    const result = parseJSONFromText(text, {})
    expect(result).toEqual({ name: 'test', count: 5 })
  })

  it('코드 블록 안의 JSON을 추출한다', () => {
    const text = '```json\n{"items": [1, 2, 3]}\n```'
    // parseJSONFromText uses regex to find { ... }, so it works with code blocks too
    const result = parseJSONFromText(text, [])
    expect(result).toEqual({ items: [1, 2, 3] })
  })

  it('중첩된 JSON을 파싱한다', () => {
    const text = 'result: {"a": {"b": "c"}, "d": [1]}'
    const result = parseJSONFromText(text, {})
    expect(result).toEqual({ a: { b: 'c' }, d: [1] })
  })

  it('유효하지 않은 JSON은 fallback을 반환한다', () => {
    const fallback = { default: true }
    expect(parseJSONFromText('not json at all', fallback)).toEqual(fallback)
  })

  it('빈 문자열은 fallback을 반환한다', () => {
    const fallback = ['default']
    expect(parseJSONFromText('', fallback)).toEqual(fallback)
  })

  it('JSON이 없는 텍스트는 fallback을 반환한다', () => {
    expect(parseJSONFromText('Hello World', null)).toBeNull()
  })

  it('깨진 JSON은 fallback을 반환한다', () => {
    const text = '{"key": value}'
    expect(parseJSONFromText(text, 'fallback')).toBe('fallback')
  })
})

describe('AI_CONTENT_LIMITS', () => {
  it('상수가 올바르게 정의되어 있다', () => {
    expect(AI_CONTENT_LIMITS.EXTRACT_CONTENT).toBe(30000)
    expect(AI_CONTENT_LIMITS.VALIDATE_CONTENT).toBe(15000)
    expect(AI_CONTENT_LIMITS.SCHEMA_MAX).toBe(100000)
  })
})
