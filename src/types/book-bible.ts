// ===== Book Bible Types =====
// 장편 책 작성 시 AI의 일관성을 유지하기 위한 컨텍스트 데이터베이스

export type BibleType = 'fiction' | 'selfhelp'

// 소설 하위 장르
export type FictionSubgenre =
  | 'general'           // 일반 소설
  | 'fantasy'           // 판타지 (정통/퓨전/게임)
  | 'martial-arts'      // 무협
  | 'romance-fantasy'   // 로맨스 판타지
  | 'hunter'            // 헌터물/현대 판타지
  | 'romance'           // 현대 로맨스
  | 'mystery'           // 미스터리/추리

// ===== 공통 타입 =====

export interface BibleBase {
  type: BibleType
  version: number
  createdAt: string
  updatedAt: string
}

// ===== Fiction Bible (소설) =====

export interface FictionCharacter {
  id: string
  name: string
  aliases?: string[]              // 별명, 호칭
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor'
  description: string             // 외모, 성격 등
  background?: string             // 배경 스토리
  traits: string[]                // 성격 특성
  relationships?: CharacterRelationship[]
  firstAppearance?: number        // 첫 등장 챕터
  arc?: string                    // 캐릭터 아크
  notes?: string
}

export interface CharacterRelationship {
  characterId: string
  characterName: string
  type: string                    // 친구, 적, 가족, 연인 등
  description?: string
}

export interface WorldSetting {
  id: string
  category: 'location' | 'culture' | 'technology' | 'magic' | 'politics' | 'history' | 'other'
  name: string
  description: string
  details?: string
  relatedCharacters?: string[]    // 연관 캐릭터 ID
  notes?: string
}

export interface PlotThread {
  id: string
  name: string
  type: 'main' | 'subplot' | 'backstory'
  description: string
  status: 'setup' | 'developing' | 'climax' | 'resolved'
  startChapter?: number
  endChapter?: number
  relatedCharacters?: string[]
  notes?: string
}

export interface Foreshadowing {
  id: string
  hint: string                    // 복선 내용
  payoff: string                  // 회수 내용
  plantedChapter?: number         // 복선 설치 챕터
  resolvedChapter?: number        // 회수 챕터
  status: 'planted' | 'resolved' | 'abandoned'
  importance: 'major' | 'minor'
  notes?: string
}

export interface TimelineEvent {
  id: string
  date: string                    // 스토리 내 시간
  event: string
  chapter?: number
  characters?: string[]
  notes?: string
}

export interface FictionStyleGuide {
  pov: 'first' | 'third-limited' | 'third-omniscient' | 'second'
  povCharacter?: string           // 1인칭/3인칭 제한의 경우 시점 캐릭터
  tense: 'past' | 'present'
  rules: string[]                 // 스타일 규칙
  vocabulary?: string[]           // 특수 용어
  prohibitions?: string[]         // 금지 사항
}

// ===== 장르별 확장 설정 =====

// 판타지 설정
export interface MagicSystem {
  id: string
  name: string                    // 마법 체계 이름
  source: string                  // 마나, 오드, 기 등
  ranks: string[]                 // 마법사 등급 (1서클~9서클 등)
  elements?: string[]             // 원소 (화염, 빙결, 뇌전 등)
  limitations?: string[]          // 제약 조건
  description: string
}

export interface Race {
  id: string
  name: string                    // 종족명
  traits: string[]                // 종족 특성
  abilities?: string[]            // 고유 능력
  weaknesses?: string[]           // 약점
  lifespan?: string               // 수명
  description: string
}

export interface Skill {
  id: string
  name: string
  type: 'active' | 'passive' | 'ultimate'
  rank?: string                   // 등급 (S, A, B 등)
  description: string
  owner?: string                  // 보유 캐릭터 ID
}

export interface PowerLevel {
  id: string
  rank: number                    // 순서
  name: string                    // 등급명
  description: string
  requirements?: string           // 달성 조건
}

export interface FantasySettings {
  magicSystems: MagicSystem[]
  races: Race[]
  skills: Skill[]
  powerLevels: PowerLevel[]
  artifacts?: Array<{
    id: string
    name: string
    rank?: string
    description: string
    owner?: string
  }>
}

// 무협 설정
export interface InternalEnergy {
  id: string
  name: string                    // 내공 이름
  type: 'orthodox' | 'unorthodox' | 'neutral'  // 정파/사파/중립
  description: string
  stages?: string[]               // 경지 단계
}

export interface MartialTechnique {
  id: string
  name: string                    // 무공명
  type: 'fist' | 'sword' | 'saber' | 'spear' | 'palm' | 'finger' | 'leg' | 'movement' | 'hidden' | 'other'
  rank: 'legendary' | 'supreme' | 'first-class' | 'second-class' | 'third-class'
  origin?: string                 // 출처 (문파/인물)
  description: string
  moves?: string[]                // 초식
  owner?: string                  // 소유 캐릭터 ID
}

export interface Faction {
  id: string
  name: string                    // 문파/세가명
  type: 'sect' | 'clan' | 'organization' | 'gang'  // 문파/세가/조직/방회
  alignment: 'orthodox' | 'unorthodox' | 'neutral' | 'evil'
  leader?: string                 // 장문인/가주
  headquarters?: string           // 본거지
  description: string
  members?: string[]              // 소속 캐릭터 ID
  techniques?: string[]           // 보유 무공 ID
  rivals?: string[]               // 적대 세력 ID
}

export interface KanghoMap {
  regions: Array<{
    id: string
    name: string                  // 지역명 (중원, 강남, 서역 등)
    dominantFactions: string[]    // 지배 세력 ID
    description: string
  }>
  powerBalance?: string           // 현재 세력 균형 설명
}

export interface MartialArtsSettings {
  internalEnergies: InternalEnergy[]
  techniques: MartialTechnique[]
  factions: Faction[]
  kanghoMap?: KanghoMap
  martialRanks?: Array<{
    id: string
    rank: number
    name: string                  // 절대고수, 일류고수, 이류고수 등
    description: string
  }>
}

// 로맨스 판타지 설정
export interface NobleFamily {
  id: string
  name: string                    // 가문명
  rank: 'royal' | 'duke' | 'marquis' | 'count' | 'viscount' | 'baron' | 'knight'
  territory?: string              // 영지
  reputation?: string             // 평판
  description: string
  members?: string[]              // 가문원 캐릭터 ID
  rivals?: string[]               // 적대 가문 ID
  allies?: string[]               // 동맹 가문 ID
}

export interface RomanceRelationship {
  id: string
  character1: string              // 캐릭터 ID
  character2: string              // 캐릭터 ID
  type: 'romantic' | 'rival' | 'friend' | 'enemy' | 'family' | 'unrequited'
  stage: 'strangers' | 'acquaintance' | 'interest' | 'tension' | 'confession' | 'dating' | 'engaged' | 'married'
  description: string
  keyMoments?: string[]           // 주요 순간들
}

export interface SocialHierarchy {
  classes: Array<{
    id: string
    rank: number
    name: string                  // 황족, 대공, 귀족, 평민 등
    privileges?: string[]
    description: string
  }>
  customs?: string[]              // 사회 관습
  taboos?: string[]               // 금기 사항
}

export interface OriginalWork {
  title?: string                  // 빙의한 원작 제목
  protagonist?: string            // 원작 주인공
  currentCharacter?: string       // 빙의된 캐릭터
  plotKnowledge?: string[]        // 알고 있는 원작 전개
  changedEvents?: string[]        // 바뀐 사건들
}

export interface RomanceFantasySettings {
  nobleFamilies: NobleFamily[]
  relationships: RomanceRelationship[]
  socialHierarchy?: SocialHierarchy
  originalWork?: OriginalWork
}

// 헌터물/현대 판타지 설정
export interface HunterRank {
  id: string
  rank: number
  name: string                    // S급, A급, B급 등
  requirements?: string
  privileges?: string[]
  population?: string             // 해당 등급 인원 수
  description: string
}

export interface Gate {
  id: string
  name?: string                   // 게이트/던전 이름
  rank: string                    // 난이도 등급
  type: 'gate' | 'dungeon' | 'rift' | 'tower'
  location?: string
  boss?: string                   // 보스 몬스터
  rewards?: string[]
  description: string
  clearedBy?: string              // 클리어한 캐릭터 ID
}

export interface HunterSkill {
  id: string
  name: string
  rank: string                    // 유니크, 레전더리, 에픽 등
  type: 'offensive' | 'defensive' | 'support' | 'utility' | 'passive'
  description: string
  owner?: string                  // 보유 캐릭터 ID
  obtainedFrom?: string           // 획득처
}

export interface Guild {
  id: string
  name: string
  rank?: string                   // 길드 등급
  leader?: string                 // 길드장 캐릭터 ID
  members?: string[]              // 멤버 캐릭터 ID
  specialization?: string         // 전문 분야
  headquarters?: string
  reputation?: string
  description: string
}

export interface HunterSettings {
  hunterRanks: HunterRank[]
  gates: Gate[]
  skills: HunterSkill[]
  guilds: Guild[]
  monsters?: Array<{
    id: string
    name: string
    rank: string
    type?: string
    abilities?: string[]
    description: string
  }>
  items?: Array<{
    id: string
    name: string
    rank: string
    type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material'
    description: string
    owner?: string
  }>
}

export interface FictionBible extends BibleBase {
  type: 'fiction'
  subgenre: FictionSubgenre       // 소설 하위 장르
  characters: FictionCharacter[]
  worldSettings: WorldSetting[]
  plotThreads: PlotThread[]
  foreshadowing: Foreshadowing[]
  timeline: TimelineEvent[]
  styleGuide: FictionStyleGuide
  // 장르별 확장 설정 (해당 장르일 때만 사용)
  fantasySettings?: FantasySettings
  martialArtsSettings?: MartialArtsSettings
  romanceFantasySettings?: RomanceFantasySettings
  hunterSettings?: HunterSettings
}

// ===== SelfHelp Bible (자기계발) =====

export interface CoreMessage {
  id: string
  title: string                   // 핵심 메시지 제목
  statement: string               // 핵심 주장
  supporting: string[]            // 뒷받침 논거
  keyPhrases: string[]            // 반복할 핵심 문구
  chapters?: number[]             // 관련 챕터들
}

export interface Framework {
  id: string
  name: string                    // 프레임워크 이름
  acronym?: string                // 약어 (예: SMART)
  description: string
  steps: FrameworkStep[]
  visualType?: 'pyramid' | 'cycle' | 'matrix' | 'list' | 'flow'
  introducedChapter?: number
  usedInChapters?: number[]
}

export interface FrameworkStep {
  order: number
  name: string
  description: string
  example?: string
}

export interface CaseStudy {
  id: string
  title: string
  type: 'success' | 'failure' | 'transformation' | 'comparison'
  subject: string                 // 주인공 (익명 또는 실명)
  isAnonymous: boolean
  situation: string               // 상황
  action: string                  // 행동
  result: string                  // 결과
  lesson: string                  // 교훈
  chapter?: number
  relatedFramework?: string       // 연관 프레임워크 ID
}

export interface Evidence {
  id: string
  type: 'research' | 'statistics' | 'quote' | 'expert' | 'historical'
  title: string
  source: string                  // 출처
  year?: number
  description: string
  citation?: string               // 인용 형식
  usedInChapters?: number[]
}

export interface ActionTool {
  id: string
  name: string
  type: 'exercise' | 'checklist' | 'template' | 'worksheet' | 'habit'
  description: string
  instructions: string[]
  chapter?: number
  relatedFramework?: string
}

export interface SelfHelpVoiceGuide {
  tone: 'authoritative' | 'friendly' | 'inspirational' | 'conversational' | 'academic'
  doList: string[]                // 권장 스타일
  dontList: string[]              // 금지 스타일
  examplePhrases?: string[]       // 예시 문구
  targetReader?: string           // 독자 페르소나
}

export interface SelfHelpBible extends BibleBase {
  type: 'selfhelp'
  coreMessages: CoreMessage[]
  frameworks: Framework[]
  caseStudies: CaseStudy[]
  evidences: Evidence[]
  actionTools: ActionTool[]
  voiceGuide: SelfHelpVoiceGuide
}

// ===== Union Type =====

export type BookBible = FictionBible | SelfHelpBible

// ===== Factory Functions =====

export function createEmptyFictionBible(subgenre: FictionSubgenre = 'general'): FictionBible {
  const now = new Date().toISOString()
  const base: FictionBible = {
    type: 'fiction',
    subgenre,
    version: 1,
    createdAt: now,
    updatedAt: now,
    characters: [],
    worldSettings: [],
    plotThreads: [],
    foreshadowing: [],
    timeline: [],
    styleGuide: {
      pov: 'third-limited',
      tense: 'past',
      rules: [],
    },
  }

  // 장르별 기본 설정 추가
  switch (subgenre) {
    case 'fantasy':
      base.fantasySettings = {
        magicSystems: [],
        races: [],
        skills: [],
        powerLevels: [],
      }
      break
    case 'martial-arts':
      base.martialArtsSettings = {
        internalEnergies: [],
        techniques: [],
        factions: [],
      }
      break
    case 'romance-fantasy':
      base.romanceFantasySettings = {
        nobleFamilies: [],
        relationships: [],
      }
      break
    case 'hunter':
      base.hunterSettings = {
        hunterRanks: [],
        gates: [],
        skills: [],
        guilds: [],
      }
      break
  }

  return base
}

export function createEmptySelfHelpBible(): SelfHelpBible {
  const now = new Date().toISOString()
  return {
    type: 'selfhelp',
    version: 1,
    createdAt: now,
    updatedAt: now,
    coreMessages: [],
    frameworks: [],
    caseStudies: [],
    evidences: [],
    actionTools: [],
    voiceGuide: {
      tone: 'friendly',
      doList: [],
      dontList: [],
    },
  }
}

export function createEmptyBible(bookType: string): BookBible {
  if (bookType === 'fiction') {
    return createEmptyFictionBible()
  }
  return createEmptySelfHelpBible()
}

// ===== Type Guards =====

export function isFictionBible(bible: BookBible): bible is FictionBible {
  return bible.type === 'fiction'
}

export function isSelfHelpBible(bible: BookBible): bible is SelfHelpBible {
  return bible.type === 'selfhelp'
}

// ===== ID Generator =====

export function generateBibleItemId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
