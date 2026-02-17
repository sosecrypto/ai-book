import { describe, it, expect } from 'vitest'
import type { Page, PaperSize } from '@/types/book'
import {
  PAGE_CHAR_LIMITS,
  PAGE_WORD_LIMITS,
  stripHtmlTags,
  countWords,
  getTextLength,
  getPageStatus,
  splitChapterToPages,
  mergePagesToChapter,
  calculateTotalPages,
  getPageRange,
  checkPageOverflow,
  splitOverflowContent,
  redistributePages,
  mergeEmptyPages,
} from './page-utils'

// Helper to create a mock page
function createPage(overrides: Partial<Page> = {}): Page {
  return {
    id: 'page-1',
    chapterId: 'ch-1',
    pageNumber: 1,
    content: '테스트 내용',
    status: 'draft',
    wordCount: 5,
    ...overrides,
  }
}

describe('PAGE_CHAR_LIMITS', () => {
  it('모든 용지 크기에 대한 제한이 정의되어 있다', () => {
    const sizes: PaperSize[] = ['a4', 'a5', 'b5', 'letter', 'novel']
    sizes.forEach((size) => {
      expect(PAGE_CHAR_LIMITS[size]).toBeGreaterThan(0)
    })
  })
})

describe('PAGE_WORD_LIMITS', () => {
  it('모든 용지 크기에 대한 단어 제한이 정의되어 있다', () => {
    const sizes: PaperSize[] = ['a4', 'a5', 'b5', 'letter', 'novel']
    sizes.forEach((size) => {
      expect(PAGE_WORD_LIMITS[size]).toBeGreaterThan(0)
    })
  })
})

describe('stripHtmlTags', () => {
  it('p 태그를 제거한다', () => {
    expect(stripHtmlTags('<p>텍스트</p>')).toBe('텍스트')
  })

  it('div 태그를 제거한다', () => {
    expect(stripHtmlTags('<div>내용</div>')).toBe('내용')
  })

  it('img 태그를 완전히 제거한다', () => {
    // img는 빈 문자열로 치환, 다른 태그는 공백으로 치환
    expect(stripHtmlTags('<p>전</p><img src="data:image/png;base64,abc123"/><p>후</p>')).toBe(
      '전 후'
    )
  })

  it('HTML 엔티티를 변환한다', () => {
    expect(stripHtmlTags('A&amp;B&lt;C&gt;D&quot;E&nbsp;F')).toBe(
      'A&B<C>D"E F'
    )
  })

  it('연속 공백을 정리한다', () => {
    expect(stripHtmlTags('가   나    다')).toBe('가 나 다')
  })

  it('빈 문자열을 처리한다', () => {
    expect(stripHtmlTags('')).toBe('')
  })

  it('복합 HTML을 처리한다', () => {
    const html = '<h1>제목</h1><p>문단 <strong>굵게</strong></p>'
    const result = stripHtmlTags(html)
    expect(result).toBe('제목 문단 굵게')
  })
})

describe('countWords', () => {
  it('한글 글자 수를 센다', () => {
    expect(countWords('안녕하세요')).toBe(5)
  })

  it('영문 단어 수를 센다', () => {
    expect(countWords('hello world')).toBe(2)
  })

  it('한글+영문 혼합을 센다', () => {
    // 한글 3자 + 영문 1단어 = 4
    expect(countWords('안녕하 hello')).toBe(4)
  })

  it('HTML이 포함된 텍스트를 처리한다', () => {
    expect(countWords('<p>안녕하세요</p>')).toBe(5)
  })

  it('빈 문자열은 0을 반환한다', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   ')).toBe(0)
  })
})

describe('getTextLength', () => {
  it('순수 텍스트 길이를 반환한다', () => {
    expect(getTextLength('hello')).toBe(5)
  })

  it('HTML 태그를 제외한 길이를 반환한다', () => {
    expect(getTextLength('<p>hello</p>')).toBe(5)
  })
})

describe('getPageStatus', () => {
  it('빈 내용은 empty를 반환한다', () => {
    expect(getPageStatus('')).toBe('empty')
    expect(getPageStatus('   ')).toBe('empty')
  })

  it('짧은 내용은 draft를 반환한다', () => {
    expect(getPageStatus('짧은 내용입니다')).toBe('draft')
  })

  it('충분한 내용은 complete를 반환한다', () => {
    // WORDS_PER_PAGE * 0.8 = 320 한글 글자 이상
    const longContent = '가'.repeat(320)
    expect(getPageStatus(longContent)).toBe('complete')
  })
})

describe('splitChapterToPages', () => {
  it('빈 내용은 빈 페이지 하나를 반환한다', () => {
    const pages = splitChapterToPages('')
    expect(pages).toHaveLength(1)
    expect(pages[0].content).toBe('')
    expect(pages[0].status).toBe('empty')
    expect(pages[0].pageNumber).toBe(1)
  })

  it('공백만 있는 내용은 빈 페이지를 반환한다', () => {
    const pages = splitChapterToPages('   ')
    expect(pages).toHaveLength(1)
    expect(pages[0].status).toBe('empty')
  })

  it('pagebreak 마커로 분리한다', () => {
    const content = '페이지1---pagebreak---페이지2---pagebreak---페이지3'
    const pages = splitChapterToPages(content)

    expect(pages).toHaveLength(3)
    expect(pages[0].content).toBe('페이지1')
    expect(pages[1].content).toBe('페이지2')
    expect(pages[2].content).toBe('페이지3')
  })

  it('페이지 번호가 startPageNumber부터 시작한다', () => {
    const content = '페이지1---pagebreak---페이지2'
    const pages = splitChapterToPages(content, 5)

    expect(pages[0].pageNumber).toBe(5)
    expect(pages[1].pageNumber).toBe(6)
  })

  it('긴 내용을 문단 단위로 분리한다', () => {
    // CHARS_PER_PAGE = 1500
    const paragraph = '가'.repeat(800)
    const content = `${paragraph}\n\n${paragraph}\n\n${paragraph}`
    const pages = splitChapterToPages(content)

    expect(pages.length).toBeGreaterThan(1)
  })

  it('wordCount를 계산한다', () => {
    const pages = splitChapterToPages('안녕하세요')
    expect(pages[0].wordCount).toBe(5)
  })

  it('짧은 내용은 한 페이지로 유지한다', () => {
    const pages = splitChapterToPages('짧은 내용')
    expect(pages).toHaveLength(1)
  })
})

describe('mergePagesToChapter', () => {
  it('페이지를 번호 순서대로 합친다', () => {
    const pages: Page[] = [
      createPage({ pageNumber: 2, content: '두 번째' }),
      createPage({ pageNumber: 1, content: '첫 번째' }),
      createPage({ pageNumber: 3, content: '세 번째' }),
    ]
    const result = mergePagesToChapter(pages)
    expect(result).toBe('첫 번째\n\n두 번째\n\n세 번째')
  })

  it('빈 페이지를 필터링한다', () => {
    const pages: Page[] = [
      createPage({ pageNumber: 1, content: '내용' }),
      createPage({ pageNumber: 2, content: '' }),
      createPage({ pageNumber: 3, content: '다음 내용' }),
    ]
    const result = mergePagesToChapter(pages)
    expect(result).toBe('내용\n\n다음 내용')
  })

  it('빈 배열은 빈 문자열을 반환한다', () => {
    expect(mergePagesToChapter([])).toBe('')
  })
})

describe('calculateTotalPages', () => {
  it('전체 페이지 수를 계산한다', () => {
    const chapters = [{ content: '짧은 내용' }, { content: '또 다른 짧은 내용' }]
    const total = calculateTotalPages(chapters)
    // 각 챕터가 1페이지씩
    expect(total).toBe(2)
  })

  it('빈 챕터 배열은 0을 반환한다', () => {
    expect(calculateTotalPages([])).toBe(0)
  })
})

describe('getPageRange', () => {
  it('첫 챕터의 페이지 범위를 반환한다', () => {
    const result = getPageRange(1, [5, 3, 4])
    expect(result).toEqual({ start: 1, end: 5 })
  })

  it('두 번째 챕터의 페이지 범위를 반환한다', () => {
    const result = getPageRange(2, [5, 3, 4])
    expect(result).toEqual({ start: 6, end: 8 })
  })

  it('세 번째 챕터의 페이지 범위를 반환한다', () => {
    const result = getPageRange(3, [5, 3, 4])
    expect(result).toEqual({ start: 9, end: 12 })
  })
})

describe('checkPageOverflow', () => {
  it('오버플로우가 없으면 isOverflow가 false이다', () => {
    const result = checkPageOverflow('짧은 내용', 'a4')
    expect(result.isOverflow).toBe(false)
    expect(result.overflowAmount).toBe(0)
  })

  it('오버플로우 시 정확한 정보를 반환한다', () => {
    const content = '가'.repeat(1500) // a4 limit is 1400
    const result = checkPageOverflow(content, 'a4')
    expect(result.isOverflow).toBe(true)
    expect(result.charCount).toBe(1500)
    expect(result.maxChars).toBe(1400)
    expect(result.overflowAmount).toBe(100)
  })

  it('각 용지 크기별로 다른 제한을 적용한다', () => {
    const content = '가'.repeat(900)
    expect(checkPageOverflow(content, 'a4').isOverflow).toBe(false)
    expect(checkPageOverflow(content, 'a5').isOverflow).toBe(true)
    expect(checkPageOverflow(content, 'novel').isOverflow).toBe(true)
  })
})

describe('splitOverflowContent', () => {
  it('제한 내의 내용은 분리하지 않는다', () => {
    const content = '짧은 내용'
    const result = splitOverflowContent(content, 'a4')
    expect(result).toEqual([content])
  })

  it('긴 내용을 여러 페이지로 분리한다', () => {
    // a4 maxChars = 1400
    const content = '가'.repeat(3000)
    const result = splitOverflowContent(content, 'a4')
    expect(result.length).toBeGreaterThan(1)
  })

  it('문단 경계에서 분리를 우선한다', () => {
    const para1 = '가'.repeat(700)
    const para2 = '나'.repeat(800)
    const content = `${para1}\n\n${para2}`
    const result = splitOverflowContent(content, 'a4')
    // 전체 텍스트 길이가 1502 (> 1400) 이므로 분리됨
    expect(result.length).toBe(2)
  })

  it('빈 페이지를 필터링한다', () => {
    const content = '가'.repeat(2000)
    const result = splitOverflowContent(content, 'a4')
    result.forEach((page) => {
      expect(page.length).toBeGreaterThan(0)
    })
  })
})

describe('redistributePages', () => {
  it('분리 불필요 시 단순 업데이트한다', () => {
    const pages = [
      createPage({ pageNumber: 1, content: '원래 내용' }),
      createPage({ pageNumber: 2, content: '두 번째' }),
    ]
    const result = redistributePages(pages, 1, '새 내용', 'a4', 'ch-1')

    expect(result).toHaveLength(2)
    expect(result[0].content).toBe('새 내용')
    expect(result[1].content).toBe('두 번째')
  })

  it('오버플로우 시 페이지를 분리하고 번호를 재조정한다', () => {
    const pages = [
      createPage({ pageNumber: 1 }),
      createPage({ pageNumber: 2, content: '두 번째' }),
    ]
    const longContent = '가'.repeat(3000) // a4 limit 1400 초과
    const result = redistributePages(pages, 1, longContent, 'a4', 'ch-1')

    expect(result.length).toBeGreaterThan(2)
    // 번호가 순서대로
    result.forEach((p, i) => {
      expect(p.pageNumber).toBe(i + 1)
    })
  })
})

describe('mergeEmptyPages', () => {
  it('단일 페이지는 그대로 반환한다', () => {
    const pages = [createPage()]
    const result = mergeEmptyPages(pages, 'a4', 'ch-1')
    expect(result).toHaveLength(1)
  })

  it('빈 배열은 그대로 반환한다', () => {
    const result = mergeEmptyPages([], 'a4', 'ch-1')
    expect(result).toHaveLength(0)
  })

  it('합칠 수 있는 짧은 페이지를 병합한다', () => {
    const pages = [
      createPage({ pageNumber: 1, content: '짧은 내용 1' }),
      createPage({ pageNumber: 2, content: '짧은 내용 2' }),
    ]
    const result = mergeEmptyPages(pages, 'a4', 'ch-1')

    // 두 페이지 합친 길이가 a4 limit(1400) 미만이므로 병합
    expect(result).toHaveLength(1)
    expect(result[0].content).toContain('짧은 내용 1')
    expect(result[0].content).toContain('짧은 내용 2')
  })

  it('빈 페이지를 건너뛴다', () => {
    const pages = [
      createPage({ pageNumber: 1, content: '내용' }),
      createPage({ pageNumber: 2, content: '' }),
      createPage({ pageNumber: 3, content: '다음 내용' }),
    ]
    const result = mergeEmptyPages(pages, 'a4', 'ch-1')

    // 빈 페이지 제거 후 두 페이지 병합
    expect(result.length).toBeLessThanOrEqual(2)
  })

  it('합칠 수 없는 큰 페이지는 유지한다', () => {
    const bigContent = '가'.repeat(1200)
    const pages = [
      createPage({ pageNumber: 1, content: bigContent }),
      createPage({ pageNumber: 2, content: bigContent }),
    ]
    const result = mergeEmptyPages(pages, 'a4', 'ch-1')

    // 합치면 2400 > 1400이므로 병합 불가
    expect(result).toHaveLength(2)
  })

  it('모든 페이지가 빈 경우 빈 페이지 하나를 반환한다', () => {
    const pages = [
      createPage({ pageNumber: 1, content: '', status: 'empty' }),
      createPage({ pageNumber: 2, content: '', status: 'empty' }),
    ]
    const result = mergeEmptyPages(pages, 'a4', 'ch-1')

    expect(result).toHaveLength(1)
    expect(result[0].content).toBe('')
    expect(result[0].status).toBe('empty')
  })

  it('병합 후 페이지 번호가 순차적이다', () => {
    const pages = [
      createPage({ pageNumber: 1, content: '가'.repeat(1200) }),
      createPage({ pageNumber: 2, content: '나'.repeat(1200) }),
      createPage({ pageNumber: 3, content: '다'.repeat(1200) }),
    ]
    const result = mergeEmptyPages(pages, 'a4', 'ch-1')

    result.forEach((p, i) => {
      expect(p.pageNumber).toBe(i + 1)
    })
  })
})
