import type { FictionBible, SelfHelpBible } from '@/types/book-bible'

export function createMockFictionBible(
  overrides: Partial<FictionBible> = {}
): FictionBible {
  const now = new Date().toISOString()
  return {
    type: 'fiction',
    subgenre: 'general',
    version: 1,
    createdAt: now,
    updatedAt: now,
    characters: [
      {
        id: 'char-1',
        name: '김주인공',
        role: 'protagonist',
        description: '용감한 주인공',
        traits: ['용감함', '정의로움'],
        firstAppearance: 1,
        relationships: [
          { characterId: 'char-2', characterName: '박조연', type: '친구' },
        ],
      },
      {
        id: 'char-2',
        name: '박조연',
        aliases: ['조연이'],
        role: 'supporting',
        description: '든든한 조연',
        traits: ['충성스러움'],
        firstAppearance: 2,
      },
      {
        id: 'char-3',
        name: '이적대',
        role: 'antagonist',
        description: '냉혹한 적대자',
        traits: ['교활함'],
        firstAppearance: 5,
      },
    ],
    worldSettings: [
      {
        id: 'ws-1',
        category: 'location',
        name: '테스트 도시',
        description: '이야기의 배경이 되는 도시',
      },
    ],
    plotThreads: [
      {
        id: 'pt-1',
        name: '메인 퀘스트',
        type: 'main',
        description: '주인공의 여정',
        status: 'developing',
        startChapter: 1,
      },
      {
        id: 'pt-2',
        name: '서브 플롯',
        type: 'subplot',
        description: '보조 이야기',
        status: 'resolved',
        startChapter: 2,
      },
    ],
    foreshadowing: [
      {
        id: 'fs-1',
        hint: '수수께끼의 편지',
        payoff: '진실이 밝혀짐',
        plantedChapter: 1,
        status: 'planted',
        importance: 'major',
      },
      {
        id: 'fs-2',
        hint: '사소한 단서',
        payoff: '나중에 활용',
        plantedChapter: 3,
        status: 'planted',
        importance: 'minor',
      },
    ],
    timeline: [],
    styleGuide: {
      pov: 'third-limited',
      povCharacter: '김주인공',
      tense: 'past',
      rules: ['짧은 문장 선호', '감정 묘사 강조'],
      vocabulary: ['특수용어1', '특수용어2'],
      prohibitions: ['비속어 금지'],
    },
    ...overrides,
  }
}

export function createMockSelfHelpBible(
  overrides: Partial<SelfHelpBible> = {}
): SelfHelpBible {
  const now = new Date().toISOString()
  return {
    type: 'selfhelp',
    version: 1,
    createdAt: now,
    updatedAt: now,
    coreMessages: [
      {
        id: 'cm-1',
        title: '핵심 메시지 1',
        statement: '성공은 습관에서 시작됩니다',
        supporting: ['뒷받침 1'],
        keyPhrases: ['습관의 힘', '작은 변화'],
        chapters: [1, 2],
      },
      {
        id: 'cm-2',
        title: '핵심 메시지 2',
        statement: '목표 설정이 중요합니다',
        supporting: ['뒷받침 2'],
        keyPhrases: ['SMART 목표'],
      },
    ],
    frameworks: [
      {
        id: 'fw-1',
        name: 'SMART 목표',
        acronym: 'SMART',
        description: '구체적이고 측정 가능한 목표 설정법',
        steps: [
          { order: 1, name: 'Specific', description: '구체적으로' },
          { order: 2, name: 'Measurable', description: '측정 가능하게' },
        ],
        introducedChapter: 2,
      },
      {
        id: 'fw-2',
        name: '5단계 프레임워크',
        description: '변화를 위한 5단계',
        steps: [],
        introducedChapter: 4,
      },
    ],
    caseStudies: [
      {
        id: 'cs-1',
        title: '성공 사례',
        type: 'success',
        subject: '홍길동',
        isAnonymous: false,
        situation: '어려운 상황',
        action: '체계적 접근',
        result: '성공적 변화',
        lesson: '꾸준함이 중요',
        chapter: 3,
      },
    ],
    evidences: [
      {
        id: 'ev-1',
        type: 'research',
        title: '습관 연구',
        source: 'Journal of Psychology',
        year: 2020,
        description: '21일 습관 형성 연구',
        usedInChapters: [1, 3],
      },
    ],
    actionTools: [],
    voiceGuide: {
      tone: 'friendly',
      doList: ['독자에게 질문하기', '실제 사례 활용'],
      dontList: ['지나친 전문 용어', '설교 톤'],
      examplePhrases: ['당신도 할 수 있습니다', '지금 바로 시작하세요', '함께 해봅시다'],
      targetReader: '20-40대 직장인',
    },
    ...overrides,
  }
}
