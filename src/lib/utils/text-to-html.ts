/**
 * 평문 텍스트를 HTML 문단으로 변환
 * AI 생성 텍스트를 에디터에서 표시하기 위해 사용
 */
export function textToHtml(text: string): string {
  if (!text) return ''

  // 이미 HTML인 경우 그대로 반환 (다양한 태그 감지)
  if (/<(?:p|h[1-6]|ul|ol|li|blockquote|strong|em|div|br)\b/i.test(text)) {
    return text
  }

  // 연속된 줄바꿈을 문단 구분자로 사용 (하위 호환: 평문 → <p> 변환)
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  // 각 문단을 <p> 태그로 감싸기
  return paragraphs
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')
}
