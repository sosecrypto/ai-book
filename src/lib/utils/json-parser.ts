/**
 * AI 응답에서 JSON을 추출하는 유틸리티
 * JSON 블록이 다른 텍스트와 섞여있을 때 사용
 */
export function parseJSONFromText<T>(text: string, fallback: T): T {
  try {
    // JSON 블록 추출 시도
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T
    }
    return fallback
  } catch {
    return fallback
  }
}

/**
 * AI 요청 시 콘텐츠 길이 제한
 */
export const AI_CONTENT_LIMITS = {
  EXTRACT_CONTENT: 30000,    // 추출 시 최대 콘텐츠 길이
  VALIDATE_CONTENT: 15000,   // 검증 시 최대 콘텐츠 길이
  SCHEMA_MAX: 100000,        // 스키마 유효성 검사 최대 길이
} as const
