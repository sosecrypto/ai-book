import { describe, it, expect } from 'vitest'
import {
  generateTableOfContents,
  addChapter,
  removeChapter,
  reorderChapters,
  addSection,
  removeSection,
} from './outline-utils'
import { createMockOutline, createMockChapterOutline } from '@/test/fixtures/outline'

describe('generateTableOfContents', () => {
  it('챕터와 섹션 엔트리를 생성한다', () => {
    const outline = createMockOutline(2)
    const toc = generateTableOfContents('테스트 책', outline)

    expect(toc.title).toBe('테스트 책')
    expect(toc.generatedAt).toBeInstanceOf(Date)

    // 챕터 2개 × (1 chapter + 2 sections) = 6 entries
    expect(toc.entries).toHaveLength(6)
    expect(toc.entries[0]).toEqual({
      type: 'chapter',
      number: '1',
      title: '챕터 1',
    })
    expect(toc.entries[1]).toEqual({
      type: 'section',
      number: '1.1',
      title: '섹션 1.1',
    })
  })

  it('빈 아웃라인에서 빈 목차를 생성한다', () => {
    const outline = createMockOutline(0)
    const toc = generateTableOfContents('빈 책', outline)

    expect(toc.entries).toHaveLength(0)
    expect(toc.title).toBe('빈 책')
  })

  it('섹션 없는 챕터를 처리한다', () => {
    const outline = createMockOutline(1, {
      chapters: [createMockChapterOutline(1, { sections: [] })],
    })
    const toc = generateTableOfContents('책', outline)

    expect(toc.entries).toHaveLength(1)
    expect(toc.entries[0].type).toBe('chapter')
  })
})

describe('addChapter', () => {
  it('끝에 챕터를 추가한다', () => {
    const outline = createMockOutline(2)
    const result = addChapter(outline, '새 챕터', '새 요약')

    expect(result.chapters).toHaveLength(3)
    expect(result.chapters[2].title).toBe('새 챕터')
    expect(result.chapters[2].number).toBe(3)
    expect(result.chapters[2].summary).toBe('새 요약')
  })

  it('특정 위치에 챕터를 삽입한다', () => {
    const outline = createMockOutline(3)
    const result = addChapter(outline, '삽입 챕터', '요약', 2)

    expect(result.chapters).toHaveLength(4)
    expect(result.chapters[1].title).toBe('삽입 챕터')
    // 번호가 재조정되었는지 확인
    expect(result.chapters[0].number).toBe(1)
    expect(result.chapters[1].number).toBe(2)
    expect(result.chapters[2].number).toBe(3)
    expect(result.chapters[3].number).toBe(4)
  })

  it('첫 번째 위치에 챕터를 삽입한다', () => {
    const outline = createMockOutline(2)
    const result = addChapter(outline, '첫 챕터', '요약', 1)

    expect(result.chapters).toHaveLength(3)
    expect(result.chapters[0].title).toBe('첫 챕터')
    expect(result.chapters[0].number).toBe(1)
  })

  it('새 챕터에 기본 섹션이 포함된다', () => {
    const outline = createMockOutline(1)
    const result = addChapter(outline, '새 챕터', '요약')

    const newChapter = result.chapters[1]
    expect(newChapter.sections).toHaveLength(1)
    expect(newChapter.sections[0].title).toBe('개요')
  })

  it('삽입 시 섹션 ID가 재조정된다', () => {
    const outline = createMockOutline(2)
    const result = addChapter(outline, '삽입', '요약', 1)

    // 두 번째 챕터(원래 첫 번째)의 섹션 ID가 2.x여야 함
    expect(result.chapters[1].sections[0].id).toBe('2.1')
  })

  it('원본 outline을 변경하지 않는다 (불변성)', () => {
    const outline = createMockOutline(2)
    const originalLength = outline.chapters.length
    addChapter(outline, '새 챕터', '요약')

    expect(outline.chapters.length).toBe(originalLength)
  })
})

describe('removeChapter', () => {
  it('챕터를 삭제한다', () => {
    const outline = createMockOutline(3)
    const result = removeChapter(outline, 2)

    expect(result.chapters).toHaveLength(2)
  })

  it('삭제 후 번호가 재조정된다', () => {
    const outline = createMockOutline(3)
    const result = removeChapter(outline, 1)

    expect(result.chapters[0].number).toBe(1)
    expect(result.chapters[1].number).toBe(2)
  })

  it('삭제 후 섹션 ID가 재조정된다', () => {
    const outline = createMockOutline(3)
    const result = removeChapter(outline, 1)

    expect(result.chapters[0].sections[0].id).toBe('1.1')
    expect(result.chapters[1].sections[0].id).toBe('2.1')
  })

  it('마지막 챕터를 삭제한다', () => {
    const outline = createMockOutline(3)
    const result = removeChapter(outline, 3)

    expect(result.chapters).toHaveLength(2)
    expect(result.chapters[1].number).toBe(2)
  })

  it('존재하지 않는 챕터 삭제는 변경 없음', () => {
    const outline = createMockOutline(2)
    const result = removeChapter(outline, 99)

    expect(result.chapters).toHaveLength(2)
  })
})

describe('reorderChapters', () => {
  it('챕터를 앞에서 뒤로 이동한다', () => {
    const outline = createMockOutline(3)
    const originalFirst = outline.chapters[0].title
    const result = reorderChapters(outline, 0, 2)

    expect(result.chapters[2].title).toBe(originalFirst)
    // 번호 재조정
    expect(result.chapters[0].number).toBe(1)
    expect(result.chapters[1].number).toBe(2)
    expect(result.chapters[2].number).toBe(3)
  })

  it('챕터를 뒤에서 앞으로 이동한다', () => {
    const outline = createMockOutline(3)
    const originalLast = outline.chapters[2].title
    const result = reorderChapters(outline, 2, 0)

    expect(result.chapters[0].title).toBe(originalLast)
  })

  it('같은 위치로 이동하면 변경 없다', () => {
    const outline = createMockOutline(3)
    const result = reorderChapters(outline, 1, 1)

    expect(result.chapters[1].title).toBe(outline.chapters[1].title)
  })

  it('재정렬 후 섹션 ID가 업데이트된다', () => {
    const outline = createMockOutline(3)
    const result = reorderChapters(outline, 0, 2)

    result.chapters.forEach((ch, idx) => {
      expect(ch.sections[0].id).toBe(`${idx + 1}.1`)
    })
  })
})

describe('addSection', () => {
  it('챕터에 섹션을 추가한다', () => {
    const outline = createMockOutline(2)
    const result = addSection(outline, 1, '새 섹션', '섹션 요약')

    const chapter = result.chapters[0]
    expect(chapter.sections).toHaveLength(3)
    expect(chapter.sections[2].title).toBe('새 섹션')
    expect(chapter.sections[2].summary).toBe('섹션 요약')
  })

  it('새 섹션의 ID 형식이 올바르다', () => {
    const outline = createMockOutline(1)
    const result = addSection(outline, 1, '새 섹션', '요약')

    const newSection = result.chapters[0].sections[2]
    expect(newSection.id).toBe('1.3')
  })

  it('새 섹션의 기본 estimatedWords는 500이다', () => {
    const outline = createMockOutline(1)
    const result = addSection(outline, 1, '새 섹션', '요약')

    expect(result.chapters[0].sections[2].estimatedWords).toBe(500)
  })

  it('다른 챕터는 변경되지 않는다', () => {
    const outline = createMockOutline(2)
    const result = addSection(outline, 1, '새 섹션', '요약')

    expect(result.chapters[1].sections).toHaveLength(2)
  })

  it('존재하지 않는 챕터에 추가하면 변경 없음', () => {
    const outline = createMockOutline(1)
    const result = addSection(outline, 99, '새 섹션', '요약')

    expect(result.chapters[0].sections).toHaveLength(2)
  })
})

describe('removeSection', () => {
  it('섹션을 삭제한다', () => {
    const outline = createMockOutline(1)
    const result = removeSection(outline, 1, '1.1')

    expect(result.chapters[0].sections).toHaveLength(1)
  })

  it('삭제 후 섹션 ID가 재조정된다', () => {
    const outline = createMockOutline(1)
    const result = removeSection(outline, 1, '1.1')

    expect(result.chapters[0].sections[0].id).toBe('1.1')
  })

  it('다른 챕터는 변경되지 않는다', () => {
    const outline = createMockOutline(2)
    const result = removeSection(outline, 1, '1.1')

    expect(result.chapters[1].sections).toHaveLength(2)
  })

  it('존재하지 않는 섹션 삭제는 변경 없음', () => {
    const outline = createMockOutline(1)
    const result = removeSection(outline, 1, 'nonexistent')

    expect(result.chapters[0].sections).toHaveLength(2)
  })
})
