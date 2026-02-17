import type { BookOutline, ChapterOutline, Section } from '@/types/book'

export function createMockSection(overrides: Partial<Section> = {}): Section {
  return {
    id: '1.1',
    title: '테스트 섹션',
    summary: '테스트 섹션 요약',
    estimatedWords: 500,
    ...overrides,
  }
}

export function createMockChapterOutline(
  number = 1,
  overrides: Partial<ChapterOutline> = {}
): ChapterOutline {
  return {
    number,
    title: `챕터 ${number}`,
    summary: `챕터 ${number} 요약입니다`,
    keyPoints: [`포인트 ${number}-1`, `포인트 ${number}-2`],
    sections: [
      createMockSection({ id: `${number}.1`, title: `섹션 ${number}.1` }),
      createMockSection({ id: `${number}.2`, title: `섹션 ${number}.2` }),
    ],
    ...overrides,
  }
}

export function createMockOutline(
  chapterCount = 3,
  overrides: Partial<BookOutline> = {}
): BookOutline {
  return {
    synopsis: '테스트 시놉시스',
    chapters: Array.from({ length: chapterCount }, (_, i) =>
      createMockChapterOutline(i + 1)
    ),
    estimatedPages: chapterCount * 10,
    targetAudience: '일반 독자',
    tone: '친근하고 전문적인',
    ...overrides,
  }
}
