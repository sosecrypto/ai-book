/**
 * Bible 컨텍스트 빌더
 *
 * AI 생성 시 Bible 데이터를 프롬프트 컨텍스트로 변환합니다.
 * 현재 챕터까지의 관련 정보만 포함하여 컨텍스트를 최적화합니다.
 */

import type {
  BookBible,
  FictionBible,
  SelfHelpBible,
  FictionCharacter,
  WorldSetting,
  PlotThread,
  CaseStudy,
  Evidence,
} from '@/types/book-bible'
import { isFictionBible, isSelfHelpBible } from '@/types/book-bible'

interface BibleContextOptions {
  currentChapter: number
  maxContextLength?: number // 최대 컨텍스트 길이 (기본: 4000자)
}

/**
 * Fiction Bible 컨텍스트 빌드
 */
function buildFictionContext(
  bible: FictionBible,
  options: BibleContextOptions
): string {
  const { currentChapter, maxContextLength = 4000 } = options
  const sections: string[] = []

  // 1. 스타일 가이드 (항상 포함)
  if (bible.styleGuide) {
    const style = bible.styleGuide
    const povMap: Record<string, string> = {
      'first': '1인칭',
      'third-limited': '3인칭 제한',
      'third-omniscient': '3인칭 전지',
      'second': '2인칭',
    }
    const tenseMap: Record<string, string> = {
      'past': '과거 시제',
      'present': '현재 시제',
    }

    let styleText = `## 문체 가이드\n`
    styleText += `- 시점: ${povMap[style.pov] || style.pov}`
    if (style.povCharacter) {
      styleText += ` (시점 캐릭터: ${style.povCharacter})`
    }
    styleText += `\n- 시제: ${tenseMap[style.tense] || style.tense}\n`

    if (style.rules && style.rules.length > 0) {
      styleText += `- 규칙:\n${style.rules.map(r => `  - ${r}`).join('\n')}\n`
    }
    if (style.vocabulary && style.vocabulary.length > 0) {
      styleText += `- 특수 용어: ${style.vocabulary.join(', ')}\n`
    }
    if (style.prohibitions && style.prohibitions.length > 0) {
      styleText += `- 금지 사항: ${style.prohibitions.join(', ')}\n`
    }
    sections.push(styleText)
  }

  // 2. 등장 캐릭터 (현재 챕터까지 등장한 + 주요 캐릭터)
  const relevantCharacters = bible.characters.filter(c =>
    c.role === 'protagonist' ||
    c.role === 'antagonist' ||
    !c.firstAppearance ||
    c.firstAppearance <= currentChapter
  )

  if (relevantCharacters.length > 0) {
    let charText = `## 등장인물\n`
    relevantCharacters.forEach(c => {
      charText += `### ${c.name}`
      if (c.aliases && c.aliases.length > 0) {
        charText += ` (${c.aliases.join(', ')})`
      }
      charText += `\n`
      charText += `- 역할: ${getRoleName(c.role)}\n`
      charText += `- 설명: ${c.description}\n`
      if (c.traits && c.traits.length > 0) {
        charText += `- 특성: ${c.traits.join(', ')}\n`
      }
      if (c.relationships && c.relationships.length > 0) {
        const rels = c.relationships.map(r => `${r.characterName}(${r.type})`).join(', ')
        charText += `- 관계: ${rels}\n`
      }
      charText += '\n'
    })
    sections.push(charText)
  }

  // 3. 세계관/설정
  const relevantSettings = bible.worldSettings.slice(0, 5) // 최대 5개
  if (relevantSettings.length > 0) {
    let settingText = `## 세계관/설정\n`
    relevantSettings.forEach(s => {
      settingText += `- **${s.name}** (${getCategoryName(s.category)}): ${s.description}\n`
    })
    sections.push(settingText)
  }

  // 3.5 장르별 설정
  if (bible.subgenre && bible.subgenre !== 'general') {
    const genreContext = buildGenreSpecificContext(bible)
    if (genreContext) {
      sections.push(genreContext)
    }
  }

  // 4. 진행 중인 플롯 라인
  const activeThreads = bible.plotThreads.filter(p =>
    p.status !== 'resolved' &&
    (!p.startChapter || p.startChapter <= currentChapter)
  )
  if (activeThreads.length > 0) {
    let plotText = `## 진행 중인 플롯\n`
    activeThreads.forEach(p => {
      plotText += `- **${p.name}** (${getPlotTypeName(p.type)}): ${p.description}\n`
      plotText += `  상태: ${getPlotStatusName(p.status)}\n`
    })
    sections.push(plotText)
  }

  // 5. 미해결 복선
  const unresolvedForeshadowing = bible.foreshadowing.filter(f =>
    f.status === 'planted' &&
    (!f.plantedChapter || f.plantedChapter <= currentChapter)
  )
  if (unresolvedForeshadowing.length > 0) {
    let foreText = `## 미해결 복선 (회수 필요)\n`
    unresolvedForeshadowing.forEach(f => {
      foreText += `- ${f.hint}`
      if (f.importance === 'major') {
        foreText += ' [중요]'
      }
      foreText += `\n  → 예정된 회수: ${f.payoff}\n`
    })
    sections.push(foreText)
  }

  // 컨텍스트 조합 및 길이 제한
  let context = sections.join('\n')
  if (context.length > maxContextLength) {
    context = context.substring(0, maxContextLength) + '\n...(이하 생략)'
  }

  return context ? `\n**[Book Bible - 소설 설정]**\n${context}` : ''
}

/**
 * SelfHelp Bible 컨텍스트 빌드
 */
function buildSelfHelpContext(
  bible: SelfHelpBible,
  options: BibleContextOptions
): string {
  const { currentChapter, maxContextLength = 4000 } = options
  const sections: string[] = []

  // 1. Voice 가이드 (항상 포함)
  if (bible.voiceGuide) {
    const voice = bible.voiceGuide
    const toneMap: Record<string, string> = {
      'authoritative': '권위 있는',
      'friendly': '친근한',
      'inspirational': '영감을 주는',
      'conversational': '대화체',
      'academic': '학술적',
    }

    let voiceText = `## 음성 가이드\n`
    voiceText += `- 톤: ${toneMap[voice.tone] || voice.tone}\n`
    if (voice.targetReader) {
      voiceText += `- 타겟 독자: ${voice.targetReader}\n`
    }
    if (voice.doList && voice.doList.length > 0) {
      voiceText += `- 권장: ${voice.doList.join(', ')}\n`
    }
    if (voice.dontList && voice.dontList.length > 0) {
      voiceText += `- 금지: ${voice.dontList.join(', ')}\n`
    }
    if (voice.examplePhrases && voice.examplePhrases.length > 0) {
      voiceText += `- 예시 문구: "${voice.examplePhrases.slice(0, 3).join('", "')}"\n`
    }
    sections.push(voiceText)
  }

  // 2. 핵심 메시지 (관련 챕터 포함)
  const relevantMessages = bible.coreMessages.filter(m =>
    !m.chapters || m.chapters.length === 0 || m.chapters.includes(currentChapter)
  )
  if (relevantMessages.length > 0) {
    let msgText = `## 핵심 메시지 (일관성 유지)\n`
    relevantMessages.forEach(m => {
      msgText += `### ${m.title}\n`
      msgText += `${m.statement}\n`
      if (m.keyPhrases && m.keyPhrases.length > 0) {
        msgText += `- 핵심 문구: "${m.keyPhrases.join('", "')}"\n`
      }
      msgText += '\n'
    })
    sections.push(msgText)
  }

  // 3. 이미 소개된 프레임워크 (현재 챕터 이전에 소개된)
  const introducedFrameworks = bible.frameworks.filter(f =>
    f.introducedChapter && f.introducedChapter < currentChapter
  )
  if (introducedFrameworks.length > 0) {
    let fwText = `## 이미 소개된 프레임워크\n`
    introducedFrameworks.forEach(f => {
      fwText += `- **${f.name}**`
      if (f.acronym) {
        fwText += ` (${f.acronym})`
      }
      fwText += `: ${f.description}\n`
    })
    sections.push(fwText)
  }

  // 4. 이 챕터에서 소개할 프레임워크
  const currentFrameworks = bible.frameworks.filter(f =>
    f.introducedChapter === currentChapter
  )
  if (currentFrameworks.length > 0) {
    let fwText = `## 이 챕터에서 소개할 프레임워크\n`
    currentFrameworks.forEach(f => {
      fwText += `### ${f.name}`
      if (f.acronym) {
        fwText += ` (${f.acronym})`
      }
      fwText += `\n${f.description}\n`
      if (f.steps && f.steps.length > 0) {
        fwText += `단계:\n`
        f.steps.forEach(s => {
          fwText += `  ${s.order}. ${s.name}: ${s.description}\n`
        })
      }
      fwText += '\n'
    })
    sections.push(fwText)
  }

  // 5. 이 챕터에서 사용할 사례
  const currentCaseStudies = bible.caseStudies.filter(c =>
    c.chapter === currentChapter
  )
  if (currentCaseStudies.length > 0) {
    let caseText = `## 이 챕터의 사례\n`
    currentCaseStudies.forEach(c => {
      caseText += `### ${c.title}\n`
      caseText += `- 유형: ${getCaseTypeName(c.type)}\n`
      caseText += `- 주인공: ${c.subject}${c.isAnonymous ? ' (익명)' : ''}\n`
      caseText += `- 상황: ${c.situation}\n`
      caseText += `- 행동: ${c.action}\n`
      caseText += `- 결과: ${c.result}\n`
      caseText += `- 교훈: ${c.lesson}\n\n`
    })
    sections.push(caseText)
  }

  // 6. 관련 증거/연구 (이 챕터에서 사용할)
  const relevantEvidence = bible.evidences.filter(e =>
    e.usedInChapters && e.usedInChapters.includes(currentChapter)
  )
  if (relevantEvidence.length > 0) {
    let evText = `## 이 챕터에서 인용할 증거\n`
    relevantEvidence.forEach(e => {
      evText += `- **${e.title}** (${getEvidenceTypeName(e.type)})\n`
      evText += `  출처: ${e.source}`
      if (e.year) {
        evText += ` (${e.year})`
      }
      evText += `\n  내용: ${e.description}\n`
    })
    sections.push(evText)
  }

  // 컨텍스트 조합 및 길이 제한
  let context = sections.join('\n')
  if (context.length > maxContextLength) {
    context = context.substring(0, maxContextLength) + '\n...(이하 생략)'
  }

  return context ? `\n**[Book Bible - 자기계발 설정]**\n${context}` : ''
}

/**
 * 메인 함수: Bible 타입에 따라 적절한 컨텍스트 빌더 호출
 */
export function buildBibleContext(
  bible: BookBible | null,
  options: BibleContextOptions
): string {
  if (!bible) {
    return ''
  }

  if (isFictionBible(bible)) {
    return buildFictionContext(bible, options)
  }

  if (isSelfHelpBible(bible)) {
    return buildSelfHelpContext(bible, options)
  }

  return ''
}

/**
 * Bible JSON 파싱 헬퍼
 */
export function parseBibleJson(bibleJson: string | null): BookBible | null {
  if (!bibleJson) {
    return null
  }
  try {
    return JSON.parse(bibleJson) as BookBible
  } catch {
    return null
  }
}

// ===== Helper Functions =====

function getRoleName(role: FictionCharacter['role']): string {
  const map: Record<string, string> = {
    protagonist: '주인공',
    antagonist: '적대자',
    supporting: '조연',
    minor: '단역',
  }
  return map[role] || role
}

function getCategoryName(category: WorldSetting['category']): string {
  const map: Record<string, string> = {
    location: '장소',
    culture: '문화',
    technology: '기술',
    magic: '마법',
    politics: '정치',
    history: '역사',
    other: '기타',
  }
  return map[category] || category
}

function getPlotTypeName(type: PlotThread['type']): string {
  const map: Record<string, string> = {
    main: '메인 플롯',
    subplot: '서브 플롯',
    backstory: '배경 스토리',
  }
  return map[type] || type
}

function getPlotStatusName(status: PlotThread['status']): string {
  const map: Record<string, string> = {
    setup: '설정 중',
    developing: '전개 중',
    climax: '클라이맥스',
    resolved: '해결됨',
  }
  return map[status] || status
}

function getCaseTypeName(type: CaseStudy['type']): string {
  const map: Record<string, string> = {
    success: '성공 사례',
    failure: '실패 사례',
    transformation: '변화 사례',
    comparison: '비교 사례',
  }
  return map[type] || type
}

function getEvidenceTypeName(type: Evidence['type']): string {
  const map: Record<string, string> = {
    research: '연구',
    statistics: '통계',
    quote: '인용',
    expert: '전문가',
    historical: '역사적',
  }
  return map[type] || type
}

/**
 * 장르별 설정 컨텍스트 빌드
 */
function buildGenreSpecificContext(bible: FictionBible): string {
  const sections: string[] = []

  // 판타지 설정
  if (bible.subgenre === 'fantasy' && bible.fantasySettings) {
    const fs = bible.fantasySettings
    let text = `## 판타지 설정\n`

    if (fs.magicSystems.length > 0) {
      text += `### 마법 체계\n`
      fs.magicSystems.forEach(m => {
        text += `- **${m.name}**: ${m.description}\n`
        if (m.source) text += `  원천: ${m.source}\n`
        if (m.ranks && m.ranks.length > 0) text += `  등급: ${m.ranks.join(' → ')}\n`
        if (m.elements && m.elements.length > 0) text += `  원소: ${m.elements.join(', ')}\n`
      })
    }

    if (fs.races.length > 0) {
      text += `### 종족\n`
      fs.races.slice(0, 5).forEach(r => {
        text += `- **${r.name}**: ${r.description}`
        if (r.traits && r.traits.length > 0) text += ` (특성: ${r.traits.join(', ')})`
        text += `\n`
      })
    }

    if (fs.powerLevels.length > 0) {
      text += `### 파워 레벨\n`
      text += fs.powerLevels
        .sort((a, b) => a.rank - b.rank)
        .map(p => `${p.rank}. ${p.name}`)
        .join(' → ') + '\n'
    }

    sections.push(text)
  }

  // 무협 설정
  if (bible.subgenre === 'martial-arts' && bible.martialArtsSettings) {
    const ms = bible.martialArtsSettings
    let text = `## 무협 설정\n`

    if (ms.factions.length > 0) {
      text += `### 문파/세가\n`
      ms.factions.forEach(f => {
        const alignmentMap: Record<string, string> = {
          orthodox: '정파', unorthodox: '사파', neutral: '중립', evil: '마도'
        }
        text += `- **${f.name}** (${alignmentMap[f.alignment] || f.alignment}): ${f.description}`
        if (f.leader) text += ` [장문인: ${f.leader}]`
        text += `\n`
      })
    }

    if (ms.techniques.length > 0) {
      text += `### 주요 무공\n`
      const rankMap: Record<string, string> = {
        legendary: '절세', supreme: '절정', 'first-class': '일류',
        'second-class': '이류', 'third-class': '삼류'
      }
      ms.techniques.slice(0, 10).forEach(t => {
        text += `- **${t.name}** (${rankMap[t.rank] || t.rank}): ${t.description}\n`
        if (t.moves && t.moves.length > 0) text += `  초식: ${t.moves.join(', ')}\n`
      })
    }

    if (ms.internalEnergies.length > 0) {
      text += `### 내공심법\n`
      ms.internalEnergies.forEach(e => {
        text += `- **${e.name}**: ${e.description}\n`
        if (e.stages && e.stages.length > 0) text += `  경지: ${e.stages.join(' → ')}\n`
      })
    }

    sections.push(text)
  }

  // 로맨스 판타지 설정
  if (bible.subgenre === 'romance-fantasy' && bible.romanceFantasySettings) {
    const rf = bible.romanceFantasySettings
    let text = `## 로맨스 판타지 설정\n`

    if (rf.nobleFamilies.length > 0) {
      text += `### 귀족 가문\n`
      const rankMap: Record<string, string> = {
        royal: '황족', duke: '공작', marquis: '후작', count: '백작',
        viscount: '자작', baron: '남작', knight: '기사'
      }
      rf.nobleFamilies.forEach(f => {
        text += `- **${f.name}** (${rankMap[f.rank] || f.rank}): ${f.description}`
        if (f.territory) text += ` [영지: ${f.territory}]`
        text += `\n`
      })
    }

    if (rf.relationships.length > 0) {
      text += `### 관계도\n`
      const typeMap: Record<string, string> = {
        romantic: '연인', rival: '라이벌', friend: '친구',
        enemy: '적', family: '가족', unrequited: '짝사랑'
      }
      const stageMap: Record<string, string> = {
        strangers: '모르는 사이', acquaintance: '아는 사이', interest: '관심',
        tension: '긴장', confession: '고백', dating: '연인',
        engaged: '약혼', married: '결혼'
      }
      rf.relationships.forEach(r => {
        text += `- ${r.character1} ↔ ${r.character2}: ${typeMap[r.type] || r.type} (${stageMap[r.stage] || r.stage})\n`
      })
    }

    if (rf.originalWork?.title) {
      text += `### 원작 정보 (빙의물)\n`
      text += `- 원작: ${rf.originalWork.title}\n`
      if (rf.originalWork.currentCharacter) text += `- 빙의 캐릭터: ${rf.originalWork.currentCharacter}\n`
      if (rf.originalWork.plotKnowledge && rf.originalWork.plotKnowledge.length > 0) {
        text += `- 알고 있는 전개:\n${rf.originalWork.plotKnowledge.map(p => `  - ${p}`).join('\n')}\n`
      }
    }

    sections.push(text)
  }

  // 헌터물 설정
  if (bible.subgenre === 'hunter' && bible.hunterSettings) {
    const hs = bible.hunterSettings
    let text = `## 헌터물 설정\n`

    if (hs.hunterRanks.length > 0) {
      text += `### 헌터 등급\n`
      text += hs.hunterRanks
        .sort((a, b) => a.rank - b.rank)
        .map(r => {
          let line = `${r.name}`
          if (r.population) line += ` (${r.population})`
          return line
        })
        .join(' → ') + '\n'
    }

    if (hs.guilds.length > 0) {
      text += `### 길드\n`
      hs.guilds.forEach(g => {
        text += `- **${g.name}**`
        if (g.rank) text += ` (${g.rank}급)`
        text += `: ${g.description}`
        if (g.leader) text += ` [길드장: ${g.leader}]`
        text += `\n`
      })
    }

    if (hs.skills.length > 0) {
      text += `### 주요 스킬\n`
      hs.skills.slice(0, 10).forEach(s => {
        text += `- **${s.name}** (${s.rank}): ${s.description}\n`
      })
    }

    if (hs.gates.length > 0) {
      text += `### 게이트/던전\n`
      hs.gates.slice(0, 5).forEach(g => {
        text += `- **${g.name || g.type}** (${g.rank}급): ${g.description}`
        if (g.boss) text += ` [보스: ${g.boss}]`
        text += `\n`
      })
    }

    sections.push(text)
  }

  return sections.join('\n')
}
