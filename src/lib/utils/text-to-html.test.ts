import { describe, it, expect } from 'vitest'
import { textToHtml } from './text-to-html'

describe('textToHtml', () => {
  describe('기본 동작', () => {
    it('빈 문자열을 빈 문자열로 반환한다', () => {
      expect(textToHtml('')).toBe('')
    })

    it('null/undefined를 빈 문자열로 처리한다', () => {
      expect(textToHtml(null as unknown as string)).toBe('')
      expect(textToHtml(undefined as unknown as string)).toBe('')
    })
  })

  describe('이미 HTML인 경우', () => {
    it('<p> 태그가 있으면 그대로 반환한다', () => {
      const html = '<p>첫 번째 문단</p><p>두 번째 문단</p>'
      expect(textToHtml(html)).toBe(html)
    })

    it('<h1> 태그가 있으면 그대로 반환한다', () => {
      const html = '<h1>제목</h1><p>내용</p>'
      expect(textToHtml(html)).toBe(html)
    })

    it('<h3>, <strong> 등 서식 태그가 있으면 그대로 반환한다', () => {
      const html = '<h3>소제목</h3><p><strong>강조</strong> 텍스트</p>'
      expect(textToHtml(html)).toBe(html)
    })

    it('<ul>/<ol> 리스트 태그가 있으면 그대로 반환한다', () => {
      const html = '<p>목록:</p><ul><li>항목 1</li><li>항목 2</li></ul>'
      expect(textToHtml(html)).toBe(html)
    })

    it('<blockquote> 태그가 있으면 그대로 반환한다', () => {
      const html = '<blockquote>인용문입니다</blockquote><p>본문</p>'
      expect(textToHtml(html)).toBe(html)
    })

    it('<em> 태그가 있으면 그대로 반환한다', () => {
      const html = '<p><em>기울임</em> 텍스트</p>'
      expect(textToHtml(html)).toBe(html)
    })

    it('AI가 생성한 복합 HTML을 그대로 반환한다', () => {
      const html = '<h3>첫 번째 장면</h3><p>도시의 불빛이 밤하늘을 물들였다.</p><p><strong>그녀는 멈춰 섰다.</strong></p>'
      expect(textToHtml(html)).toBe(html)
    })
  })

  describe('평문 텍스트 변환', () => {
    it('단일 문단을 <p> 태그로 감싼다', () => {
      const text = '이것은 단일 문단입니다.'
      expect(textToHtml(text)).toBe('<p>이것은 단일 문단입니다.</p>')
    })

    it('빈 줄로 구분된 문단을 각각 <p> 태그로 감싼다', () => {
      const text = '첫 번째 문단입니다.\n\n두 번째 문단입니다.'
      expect(textToHtml(text)).toBe('<p>첫 번째 문단입니다.</p><p>두 번째 문단입니다.</p>')
    })

    it('단일 줄바꿈은 <br>로 변환한다', () => {
      const text = '첫 번째 줄\n두 번째 줄'
      expect(textToHtml(text)).toBe('<p>첫 번째 줄<br>두 번째 줄</p>')
    })

    it('여러 빈 줄은 하나의 문단 구분자로 처리한다', () => {
      const text = '첫 번째 문단\n\n\n\n두 번째 문단'
      expect(textToHtml(text)).toBe('<p>첫 번째 문단</p><p>두 번째 문단</p>')
    })

    it('앞뒤 공백을 제거한다', () => {
      const text = '  첫 번째 문단  \n\n  두 번째 문단  '
      expect(textToHtml(text)).toBe('<p>첫 번째 문단</p><p>두 번째 문단</p>')
    })

    it('빈 문단은 무시한다', () => {
      const text = '첫 번째 문단\n\n\n\n\n\n두 번째 문단'
      expect(textToHtml(text)).toBe('<p>첫 번째 문단</p><p>두 번째 문단</p>')
    })
  })

  describe('복잡한 케이스', () => {
    it('혼합된 줄바꿈 패턴을 올바르게 처리한다', () => {
      const text = '첫 번째 문단\n첫 문단 계속\n\n두 번째 문단\n두 번째 계속\n\n세 번째 문단'
      expect(textToHtml(text)).toBe(
        '<p>첫 번째 문단<br>첫 문단 계속</p><p>두 번째 문단<br>두 번째 계속</p><p>세 번째 문단</p>'
      )
    })

    it('AI 생성 텍스트 스타일을 처리한다', () => {
      const aiText = `이것은 AI가 생성한 첫 번째 문단입니다. 문단은 여러 문장으로 구성될 수 있습니다.

이것은 두 번째 문단입니다. 빈 줄로 구분되어 있습니다.

세 번째 문단은 마지막입니다.`

      const result = textToHtml(aiText)
      expect(result).toContain('<p>이것은 AI가 생성한 첫 번째 문단입니다.')
      expect(result).toContain('<p>이것은 두 번째 문단입니다.')
      expect(result).toContain('<p>세 번째 문단은 마지막입니다.</p>')
    })

    it('공백만 있는 줄은 문단 구분자로 처리한다', () => {
      const text = '첫 번째 문단\n   \n두 번째 문단'
      expect(textToHtml(text)).toBe('<p>첫 번째 문단</p><p>두 번째 문단</p>')
    })
  })
})
