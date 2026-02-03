'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type {
  BookBible,
  FictionBible,
  SelfHelpBible,
  FictionCharacter,
} from '@/types/book-bible'
import { isFictionBible, createEmptyBible } from '@/types/book-bible'
import { useToast } from '@/hooks/useToast'

interface BiblePanelProps {
  projectId: string
  projectType: string
  currentChapter: number
  onExtract?: (content: string) => void
  chapterContent?: string
}

interface ExtractedItems {
  type: 'fiction' | 'selfhelp'
  characters?: FictionCharacter[]
  settings?: Array<{ id: string; name: string; category: string; description: string }>
  messages?: Array<{ id: string; title: string; statement: string }>
  frameworks?: Array<{ id: string; name: string; description: string }>
}

interface ValidationIssue {
  type: string
  severity: 'error' | 'warning' | 'info'
  title: string
  description: string
  suggestion?: string
}

export default function BiblePanel({
  projectId,
  projectType,
  currentChapter,
  chapterContent,
}: BiblePanelProps) {
  const { showToast } = useToast()
  const [bible, setBible] = useState<BookBible | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'view' | 'extract' | 'validate'>('view')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [extractedItems, setExtractedItems] = useState<ExtractedItems | null>(null)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    issues: ValidationIssue[]
    summary: string
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showExtractPrompt, setShowExtractPrompt] = useState(false)

  const loadBible = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/bible`)
      const data = await res.json()
      if (data.success) {
        setBible(data.data)
      }
    } catch {
      setBible(createEmptyBible(projectType))
    } finally {
      setIsLoading(false)
    }
  }, [projectId, projectType])

  useEffect(() => {
    loadBible()
  }, [loadBible])

  // 자동추출 프롬프트 표시 로직
  useEffect(() => {
    if (bible && chapterContent && chapterContent.length >= 500) {
      const isEmpty = isFictionBible(bible)
        ? bible.characters.length === 0 && bible.worldSettings.length === 0
        : bible.coreMessages.length === 0 && bible.frameworks.length === 0

      if (isEmpty) {
        setShowExtractPrompt(true)
      }
    }
  }, [bible, chapterContent])

  const handleExtract = async () => {
    if (!chapterContent || chapterContent.length < 100) {
      showToast({
        type: 'warning',
        message: '추출할 내용이 부족합니다. 최소 100자 이상의 내용이 필요합니다.',
      })
      return
    }

    setIsExtracting(true)
    setExtractedItems(null)
    setShowExtractPrompt(false)
    try {
      const res = await fetch(`/api/projects/${projectId}/bible/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterNumber: currentChapter,
          content: chapterContent,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setExtractedItems({
          type: data.data.type,
          ...data.data.extracted,
        })
        setActiveTab('extract')
        showToast({
          type: 'success',
          message: '설정이 추출되었습니다. 추출 결과 탭에서 확인하세요.',
        })
      }
    } catch {
      showToast({
        type: 'error',
        message: '추출에 실패했습니다. 다시 시도해주세요.',
        action: { label: '다시 시도', onClick: handleExtract },
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleValidate = async () => {
    if (!chapterContent || chapterContent.length < 100) {
      showToast({
        type: 'warning',
        message: '검증할 내용이 부족합니다. 최소 100자 이상의 내용이 필요합니다.',
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/bible/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: chapterContent,
          chapterNumber: currentChapter,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setValidationResult(data.data)
        setActiveTab('validate')
        if (data.data.isValid) {
          showToast({
            type: 'success',
            message: '일관성 검증을 통과했습니다!',
          })
        } else {
          showToast({
            type: 'warning',
            message: `${data.data.issues.length}개의 검토 사항이 발견되었습니다.`,
          })
        }
      }
    } catch {
      showToast({
        type: 'error',
        message: '검증에 실패했습니다. 다시 시도해주세요.',
        action: { label: '다시 시도', onClick: handleValidate },
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleAddToBible = async (itemType: string, item: unknown) => {
    if (!bible) return
    setIsSaving(true)

    try {
      let updatedBible: BookBible

      if (isFictionBible(bible)) {
        const fBible = bible as FictionBible
        if (itemType === 'character') {
          updatedBible = {
            ...fBible,
            characters: [...fBible.characters, item as FictionCharacter],
          }
        } else if (itemType === 'setting') {
          updatedBible = {
            ...fBible,
            worldSettings: [...fBible.worldSettings, item as FictionBible['worldSettings'][0]],
          }
        } else if (itemType === 'plot') {
          updatedBible = {
            ...fBible,
            plotThreads: [...fBible.plotThreads, item as FictionBible['plotThreads'][0]],
          }
        } else if (itemType === 'foreshadowing') {
          updatedBible = {
            ...fBible,
            foreshadowing: [...fBible.foreshadowing, item as FictionBible['foreshadowing'][0]],
          }
        } else {
          return
        }
      } else {
        const sBible = bible as SelfHelpBible
        if (itemType === 'message') {
          updatedBible = {
            ...sBible,
            coreMessages: [...sBible.coreMessages, item as SelfHelpBible['coreMessages'][0]],
          }
        } else if (itemType === 'framework') {
          updatedBible = {
            ...sBible,
            frameworks: [...sBible.frameworks, item as SelfHelpBible['frameworks'][0]],
          }
        } else if (itemType === 'case') {
          updatedBible = {
            ...sBible,
            caseStudies: [...sBible.caseStudies, item as SelfHelpBible['caseStudies'][0]],
          }
        } else {
          return
        }
      }

      const res = await fetch(`/api/projects/${projectId}/bible`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBible),
      })

      if (res.ok) {
        setBible(updatedBible)
        showToast({
          type: 'success',
          message: 'Bible에 추가되었습니다.',
        })
        // 추가된 항목 제거
        if (extractedItems) {
          const itemWithId = item as { id: string }
          const key = itemType + 's' as keyof ExtractedItems
          const currentArray = extractedItems[key] as Array<{ id: string }> | undefined
          if (currentArray) {
            setExtractedItems({
              ...extractedItems,
              [key]: currentArray.filter((i) => i.id !== itemWithId.id),
            })
          }
        }
      }
    } catch {
      showToast({
        type: 'error',
        message: '저장에 실패했습니다. 다시 시도해주세요.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-neutral-400"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex-none p-3 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
            Book Bible
          </h3>
          <span className="text-xs text-neutral-500">Ch.{currentChapter}</span>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={handleExtract}
            disabled={isExtracting || !chapterContent}
            className="flex-1 px-2 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors"
          >
            {isExtracting ? '추출 중...' : '자동 추출'}
          </button>
          <button
            onClick={handleValidate}
            disabled={isValidating || !chapterContent}
            className="flex-1 px-2 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors"
          >
            {isValidating ? '검증 중...' : '일관성 검증'}
          </button>
        </div>
      </div>

      {/* 자동추출 프롬프트 */}
      {showExtractPrompt && (
        <div className="mx-3 mb-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded">
          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
            챕터에서 설정을 자동으로 추출할 수 있어요!
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            캐릭터, 세계관 등을 AI가 자동으로 찾아냅니다.
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => { handleExtract(); setShowExtractPrompt(false) }}
              disabled={isExtracting}
              className="flex-1 px-3 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors rounded"
            >
              {isExtracting ? '추출 중...' : '지금 추출하기'}
            </button>
            <button
              onClick={() => setShowExtractPrompt(false)}
              className="px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              나중에
            </button>
          </div>
        </div>
      )}

      {/* 탭 */}
      <div className="flex-none flex border-b border-neutral-200 dark:border-neutral-700">
        {(['view', 'extract', 'validate'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors relative ${
              activeTab === tab
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            {tab === 'view' ? '설정 보기' : tab === 'extract' ? '추출 결과' : '검증 결과'}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white" />
            )}
            {tab === 'extract' && extractedItems && (
              <span className="ml-1 px-1 py-0.5 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 rounded">
                NEW
              </span>
            )}
            {tab === 'validate' && validationResult && !validationResult.isValid && (
              <span className="ml-1 px-1 py-0.5 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 rounded">
                !
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'view' && bible && (
          <BibleViewTab bible={bible} />
        )}

        {activeTab === 'extract' && (
          <ExtractResultTab
            items={extractedItems}
            onAdd={handleAddToBible}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'validate' && (
          <ValidationResultTab result={validationResult} projectId={projectId} />
        )}
      </div>
    </div>
  )
}

// Bible 보기 탭
function BibleViewTab({ bible }: { bible: BookBible }) {
  if (isFictionBible(bible)) {
    const fBible = bible as FictionBible
    return (
      <div className="space-y-4 text-xs">
        {fBible.characters.length > 0 && (
          <div>
            <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
              캐릭터 ({fBible.characters.length})
            </h4>
            <div className="space-y-2">
              {fBible.characters.slice(0, 5).map(c => (
                <div key={c.id} className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                  <span className="font-medium text-neutral-900 dark:text-white">{c.name}</span>
                  <span className="text-neutral-500 dark:text-neutral-400 ml-2">
                    {c.role === 'protagonist' ? '주인공' : c.role === 'antagonist' ? '적대자' : c.role === 'supporting' ? '조연' : '단역'}
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">
                    {c.description}
                  </p>
                </div>
              ))}
              {fBible.characters.length > 5 && (
                <p className="text-neutral-400 text-center">+{fBible.characters.length - 5}명 더</p>
              )}
            </div>
          </div>
        )}

        {fBible.worldSettings.length > 0 && (
          <div>
            <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
              세계관 ({fBible.worldSettings.length})
            </h4>
            <div className="space-y-1">
              {fBible.worldSettings.slice(0, 3).map(s => (
                <div key={s.id} className="text-neutral-600 dark:text-neutral-300">
                  <span className="font-medium">{s.name}</span>: {s.description.substring(0, 50)}...
                </div>
              ))}
            </div>
          </div>
        )}

        {fBible.plotThreads.length > 0 && (
          <div>
            <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
              플롯 ({fBible.plotThreads.length})
            </h4>
            <div className="space-y-1">
              {fBible.plotThreads.map(p => (
                <div key={p.id} className="text-neutral-600 dark:text-neutral-300">
                  • {p.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {fBible.characters.length === 0 && fBible.worldSettings.length === 0 && (
          <p className="text-center text-neutral-400 dark:text-neutral-500 py-8">
            설정된 항목이 없습니다.<br />
            자동 추출을 사용해보세요.
          </p>
        )}
      </div>
    )
  }

  // SelfHelp
  const sBible = bible as SelfHelpBible
  return (
    <div className="space-y-4 text-xs">
      {sBible.coreMessages.length > 0 && (
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
            핵심 메시지 ({sBible.coreMessages.length})
          </h4>
          <div className="space-y-2">
            {sBible.coreMessages.slice(0, 3).map(m => (
              <div key={m.id} className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                <span className="font-medium text-neutral-900 dark:text-white">{m.title}</span>
                <p className="text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">
                  {m.statement}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {sBible.frameworks.length > 0 && (
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
            프레임워크 ({sBible.frameworks.length})
          </h4>
          <div className="space-y-1">
            {sBible.frameworks.map(f => (
              <div key={f.id} className="text-neutral-600 dark:text-neutral-300">
                • <span className="font-medium">{f.name}</span>
                {f.acronym && ` (${f.acronym})`}
              </div>
            ))}
          </div>
        </div>
      )}

      {sBible.coreMessages.length === 0 && sBible.frameworks.length === 0 && (
        <p className="text-center text-neutral-400 dark:text-neutral-500 py-8">
          설정된 항목이 없습니다.<br />
          자동 추출을 사용해보세요.
        </p>
      )}
    </div>
  )
}

// 추출 결과 탭
function ExtractResultTab({
  items,
  onAdd,
  isSaving,
}: {
  items: ExtractedItems | null
  onAdd: (type: string, item: unknown) => void
  isSaving: boolean
}) {
  if (!items) {
    return (
      <p className="text-center text-neutral-400 dark:text-neutral-500 py-8 text-xs">
        자동 추출 버튼을 눌러<br />
        챕터에서 설정을 추출하세요.
      </p>
    )
  }

  const hasItems =
    (items.characters?.length || 0) > 0 ||
    (items.settings?.length || 0) > 0 ||
    (items.messages?.length || 0) > 0 ||
    (items.frameworks?.length || 0) > 0

  if (!hasItems) {
    return (
      <p className="text-center text-neutral-400 dark:text-neutral-500 py-8 text-xs">
        새로 추출된 항목이 없습니다.<br />
        이미 Bible에 등록된 항목이거나<br />
        추출할 내용이 없습니다.
      </p>
    )
  }

  return (
    <div className="space-y-4 text-xs">
      {items.characters && items.characters.length > 0 && (
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
            새 캐릭터 ({items.characters.length})
          </h4>
          {items.characters.map(c => (
            <div key={c.id} className="p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-neutral-900 dark:text-white">{c.name}</span>
                  <p className="text-neutral-600 dark:text-neutral-300 mt-1 text-[11px]">
                    {c.description}
                  </p>
                </div>
                <button
                  onClick={() => onAdd('character', c)}
                  disabled={isSaving}
                  className="px-2 py-1 text-[10px] bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  추가
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.settings && items.settings.length > 0 && (
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
            새 설정 ({items.settings.length})
          </h4>
          {items.settings.map(s => (
            <div key={s.id} className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-neutral-900 dark:text-white">{s.name}</span>
                  <p className="text-neutral-600 dark:text-neutral-300 mt-1 text-[11px]">
                    {s.description}
                  </p>
                </div>
                <button
                  onClick={() => onAdd('setting', s)}
                  disabled={isSaving}
                  className="px-2 py-1 text-[10px] bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  추가
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.messages && items.messages.length > 0 && (
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
            새 메시지 ({items.messages.length})
          </h4>
          {items.messages.map(m => (
            <div key={m.id} className="p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-neutral-900 dark:text-white">{m.title}</span>
                  <p className="text-neutral-600 dark:text-neutral-300 mt-1 text-[11px]">
                    {m.statement}
                  </p>
                </div>
                <button
                  onClick={() => onAdd('message', m)}
                  disabled={isSaving}
                  className="px-2 py-1 text-[10px] bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  추가
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.frameworks && items.frameworks.length > 0 && (
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
            새 프레임워크 ({items.frameworks.length})
          </h4>
          {items.frameworks.map(f => (
            <div key={f.id} className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-neutral-900 dark:text-white">{f.name}</span>
                  <p className="text-neutral-600 dark:text-neutral-300 mt-1 text-[11px]">
                    {f.description}
                  </p>
                </div>
                <button
                  onClick={() => onAdd('framework', f)}
                  disabled={isSaving}
                  className="px-2 py-1 text-[10px] bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  추가
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 검증 결과 탭
function ValidationResultTab({
  result,
  projectId,
}: {
  result: { isValid: boolean; issues: ValidationIssue[]; summary: string } | null
  projectId: string
}) {
  if (!result) {
    return (
      <p className="text-center text-neutral-400 dark:text-neutral-500 py-8 text-xs">
        일관성 검증 버튼을 눌러<br />
        Bible과의 일치 여부를 확인하세요.
      </p>
    )
  }

  return (
    <div className="space-y-4 text-xs">
      {/* 요약 */}
      <div className={`p-3 rounded ${
        result.isValid
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          {result.isValid ? (
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span className={`font-medium ${
            result.isValid
              ? 'text-green-700 dark:text-green-300'
              : 'text-amber-700 dark:text-amber-300'
          }`}>
            {result.isValid ? '일관성 확인됨' : '검토 필요'}
          </span>
        </div>
        <p className={`text-[11px] ${
          result.isValid
            ? 'text-green-600 dark:text-green-400'
            : 'text-amber-600 dark:text-amber-400'
        }`}>
          {result.summary}
        </p>
      </div>

      {/* 이슈 목록 */}
      {result.issues.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-neutral-900 dark:text-white">
            발견된 이슈 ({result.issues.length})
          </h4>
          {result.issues.map((issue, i) => (
            <div
              key={i}
              className={`p-2 rounded border ${
                issue.severity === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : issue.severity === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className={`text-[10px] px-1 py-0.5 rounded ${
                  issue.severity === 'error'
                    ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200'
                    : issue.severity === 'warning'
                    ? 'bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-200'
                    : 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200'
                }`}>
                  {issue.type}
                </span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {issue.title}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 text-[11px]">
                {issue.description}
              </p>
              {issue.suggestion && (
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-1 italic">
                  제안: {issue.suggestion}
                </p>
              )}
              {/* 액션 버튼 */}
              <div className="mt-2 flex gap-2">
                <Link href={`/project/${projectId}/outline?tab=bible`}>
                  <button className="px-2 py-1 text-[10px] text-violet-600 dark:text-violet-400 border border-violet-300 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded transition-colors">
                    Bible 수정
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 해결 방법 안내 */}
      {!result.isValid && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
          <h5 className="text-xs font-medium text-blue-800 dark:text-blue-200 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            해결 방법
          </h5>
          <ul className="text-[11px] mt-2 space-y-1 text-blue-700 dark:text-blue-300">
            <li className="flex items-start gap-1.5">
              <span className="text-blue-500 dark:text-blue-400 font-bold">1.</span>
              <span>내용이 틀렸다면 본문을 수정하세요</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-500 dark:text-blue-400 font-bold">2.</span>
              <span>설정이 변경되었다면 &quot;Bible 수정&quot;으로 업데이트하세요</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-500 dark:text-blue-400 font-bold">3.</span>
              <span>의도된 변화라면 무시해도 됩니다</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
