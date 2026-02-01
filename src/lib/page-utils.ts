import type { Page, PageStatus } from '@/types/book'

const CHARS_PER_PAGE = 1500
const WORDS_PER_PAGE = 400

export function countWords(text: string): number {
  if (!text.trim()) return 0
  const koreanChars = (text.match(/[\uAC00-\uD7AF]/g) || []).length
  const englishWords = text
    .replace(/[\uAC00-\uD7AF]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
  return koreanChars + englishWords
}

export function getPageStatus(content: string): PageStatus {
  const wordCount = countWords(content)
  if (wordCount === 0) return 'empty'
  if (wordCount >= WORDS_PER_PAGE * 0.8) return 'complete'
  return 'draft'
}

export function splitChapterToPages(content: string, startPageNumber = 1): Omit<Page, 'id' | 'chapterId' | 'createdAt' | 'updatedAt'>[] {
  if (!content.trim()) {
    return [{
      pageNumber: startPageNumber,
      content: '',
      status: 'empty',
      wordCount: 0,
    }]
  }

  const pageBreakMarker = '---pagebreak---'
  const hasManualBreaks = content.includes(pageBreakMarker)

  if (hasManualBreaks) {
    const sections = content.split(pageBreakMarker)
    return sections.map((section, idx) => {
      const trimmedContent = section.trim()
      const wordCount = countWords(trimmedContent)
      return {
        pageNumber: startPageNumber + idx,
        content: trimmedContent,
        status: getPageStatus(trimmedContent),
        wordCount,
      }
    })
  }

  const paragraphs = content.split(/\n\n+/)
  const pages: Omit<Page, 'id' | 'chapterId' | 'createdAt' | 'updatedAt'>[] = []
  let currentPageContent = ''
  let pageNumber = startPageNumber

  for (const para of paragraphs) {
    const potentialContent = currentPageContent
      ? currentPageContent + '\n\n' + para
      : para

    if (potentialContent.length > CHARS_PER_PAGE && currentPageContent) {
      const wordCount = countWords(currentPageContent)
      pages.push({
        pageNumber: pageNumber++,
        content: currentPageContent.trim(),
        status: getPageStatus(currentPageContent),
        wordCount,
      })
      currentPageContent = para
    } else {
      currentPageContent = potentialContent
    }
  }

  if (currentPageContent.trim()) {
    const wordCount = countWords(currentPageContent)
    pages.push({
      pageNumber: pageNumber,
      content: currentPageContent.trim(),
      status: getPageStatus(currentPageContent),
      wordCount,
    })
  }

  return pages.length > 0 ? pages : [{
    pageNumber: startPageNumber,
    content: '',
    status: 'empty',
    wordCount: 0,
  }]
}

export function mergePagesToChapter(pages: Page[]): string {
  return pages
    .slice()
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .map((p) => p.content)
    .filter((c) => c.trim())
    .join('\n\n')
}

export function calculateTotalPages(chapters: { content: string }[]): number {
  return chapters.reduce((total, ch) => {
    const pageData = splitChapterToPages(ch.content)
    return total + pageData.length
  }, 0)
}

export function getPageRange(chapterNumber: number, chaptersBeforeCount: number[]): { start: number; end: number } {
  let start = 1
  for (let i = 0; i < chapterNumber - 1 && i < chaptersBeforeCount.length; i++) {
    start += chaptersBeforeCount[i]
  }
  const end = start + (chaptersBeforeCount[chapterNumber - 1] || 1) - 1
  return { start, end }
}
