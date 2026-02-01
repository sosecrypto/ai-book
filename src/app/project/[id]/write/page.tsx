'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import StageHeader from '@/components/project/StageHeader'
import { ChapterList, ChapterEditor } from '@/components/write'
import { PageEditor } from '@/components/page-editor'
import { FileUploader, ChapterSplitter } from '@/components/upload'
import { BookOutline, ChapterOutline, Chapter, ParsedFile, SplitChapter, PageGenerateMode } from '@/types/book'
import { CheckIcon, ArrowPathIcon, DocumentArrowUpIcon, XMarkIcon, Squares2X2Icon, Bars3Icon } from '@heroicons/react/24/outline'

interface WriteState {
  outline: BookOutline | null
  chapters: Map<number, Chapter>
  currentChapter: number
  isWriting: boolean
  streamingContent: string
}

type ImportStep = 'upload' | 'split'
type EditorMode = 'chapter' | 'page'

export default function WritePage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [state, setState] = useState<WriteState>({
    outline: null,
    chapters: new Map(),
    currentChapter: 1,
    isWriting: false,
    streamingContent: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importStep, setImportStep] = useState<ImportStep>('upload')
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode>('page')
  const [chapterId, setChapterId] = useState<string | null>(null)

  useEffect(() => {
    loadProjectData()
  }, [projectId])

  useEffect(() => {
    if (editorMode === 'chapter') {
      const interval = setInterval(() => {
        const currentContent = state.chapters.get(state.currentChapter)
        if (currentContent && currentContent.content) {
          saveChapter(state.currentChapter, currentContent)
        }
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [state.chapters, state.currentChapter, editorMode])

  const loadProjectData = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      if (res.ok) {
        const { data: project } = await res.json()
        if (!project.outline) {
          router.push(`/project/${projectId}/outline`)
          return
        }
        const chaptersMap = new Map<number, Chapter>()
        let firstChapterId: string | null = null
        project.chapters?.forEach((ch: Chapter) => {
          chaptersMap.set(ch.number, ch)
          // 첫 번째 챕터 또는 현재 선택된 챕터의 ID 저장
          if (ch.number === 1 && ch.id) {
            firstChapterId = ch.id
          }
          if (ch.number === state.currentChapter && ch.id) {
            setChapterId(ch.id)
          }
        })
        // 현재 챕터 ID가 없으면 첫 번째 챕터 ID 사용
        if (!chapterId && firstChapterId) {
          setChapterId(firstChapterId)
        }
        setState(prev => ({
          ...prev,
          outline: project.outline,
          chapters: chaptersMap
        }))
      }
    } catch {
      setError('프로젝트를 불러오는데 실패했습니다.')
    }
  }

  const getCurrentChapterOutline = (): ChapterOutline | null => {
    if (!state.outline) return null
    return state.outline.chapters.find(ch => ch.number === state.currentChapter) || null
  }

  const getCurrentChapter = (): Chapter | null => {
    return state.chapters.get(state.currentChapter) || null
  }

  const saveChapter = async (number: number, chapter: Chapter) => {
    setIsSaving(true)
    try {
      await fetch(`/api/projects/${projectId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number,
          title: chapter.title,
          content: chapter.content,
          status: chapter.status || 'writing'
        })
      })
      setLastSaved(new Date())
    } catch {
      setError('챕터 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleContentChange = (content: string) => {
    const chapterOutline = getCurrentChapterOutline()
    if (!chapterOutline) return

    const updatedChapter: Chapter = {
      number: state.currentChapter,
      title: chapterOutline.title,
      content,
      status: 'writing',
      revisions: []
    }

    setState(prev => {
      const newChapters = new Map(prev.chapters)
      newChapters.set(state.currentChapter, updatedChapter)
      return { ...prev, chapters: newChapters }
    })
  }

  const handleAIWrite = async () => {
    const chapterOutline = getCurrentChapterOutline()
    if (!chapterOutline || state.isWriting) return

    setState(prev => ({ ...prev, isWriting: true, streamingContent: '' }))
    setError(null)

    try {
      const previousChapters: { number: number; title: string; summary: string }[] = []
      state.outline?.chapters.forEach(ch => {
        if (ch.number < state.currentChapter) {
          const existingChapter = state.chapters.get(ch.number)
          previousChapters.push({
            number: ch.number,
            title: ch.title,
            summary: existingChapter?.content?.substring(0, 500) || ch.summary
          })
        }
      })

      const response = await fetch(`/api/projects/${projectId}/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterNumber: state.currentChapter,
          chapterOutline,
          previousChapters
        })
      })

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk
        setState(prev => ({ ...prev, streamingContent: fullContent }))
      }

      const updatedChapter: Chapter = {
        number: state.currentChapter,
        title: chapterOutline.title,
        content: fullContent,
        status: 'writing',
        revisions: []
      }

      setState(prev => {
        const newChapters = new Map(prev.chapters)
        newChapters.set(state.currentChapter, updatedChapter)
        return {
          ...prev,
          chapters: newChapters,
          isWriting: false,
          streamingContent: ''
        }
      })

      await saveChapter(state.currentChapter, updatedChapter)
    } catch {
      setError('AI 집필에 실패했습니다. 다시 시도해주세요.')
      setState(prev => ({ ...prev, isWriting: false }))
    }
  }

  const handleChapterSelect = (number: number) => {
    setState(prev => ({ ...prev, currentChapter: number }))

    // Map에서 직접 챕터 ID 가져오기
    const chapter = state.chapters.get(number)
    if (chapter?.id) {
      setChapterId(chapter.id)
    }
  }

  const handlePreviousChapter = () => {
    if (state.currentChapter > 1) {
      handleChapterSelect(state.currentChapter - 1)
    }
  }

  const handleNextChapter = () => {
    if (state.outline && state.currentChapter < state.outline.chapters.length) {
      handleChapterSelect(state.currentChapter + 1)
    }
  }

  const handleManualSave = async () => {
    const chapter = getCurrentChapter()
    if (chapter) {
      await saveChapter(state.currentChapter, chapter)
    }
  }

  const handlePageSave = useCallback(async (content: string) => {
    const chapterOutline = getCurrentChapterOutline()
    if (!chapterOutline) return

    const updatedChapter: Chapter = {
      number: state.currentChapter,
      title: chapterOutline.title,
      content,
      status: 'writing',
      revisions: []
    }

    setState(prev => {
      const newChapters = new Map(prev.chapters)
      newChapters.set(state.currentChapter, updatedChapter)
      return { ...prev, chapters: newChapters }
    })

    await saveChapter(state.currentChapter, updatedChapter)
  }, [state.currentChapter, projectId])

  const handlePageAIGenerate = useCallback(async (mode: PageGenerateMode, pageNumber: number, context: string) => {
    if (!chapterId) {
      setError('챕터 ID를 찾을 수 없습니다.')
      return
    }

    const currentChapter = getCurrentChapter()

    const response = await fetch(`/api/projects/${projectId}/chapters/${chapterId}/pages/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageNumber,
        mode: mode.mode,
        context,
        currentContent: currentChapter?.content
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      fullContent += chunk
    }

    await handlePageSave(fullContent)
  }, [chapterId, projectId, handlePageSave])

  const handleNextStage = async () => {
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'edit', status: 'writing' })
      })
      router.push(`/project/${projectId}/edit`)
    } catch {
      setError('다음 단계로 이동하는데 실패했습니다.')
    }
  }

  const handlePreviousStage = () => {
    router.push(`/project/${projectId}/outline`)
  }

  const handleFileLoaded = (file: ParsedFile) => {
    setParsedFile(file)
    setImportStep('split')
  }

  const handleImportChapters = async (chapters: SplitChapter[]) => {
    setIsImporting(true)
    try {
      for (const ch of chapters) {
        await fetch(`/api/projects/${projectId}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: ch.number,
            title: ch.title,
            content: ch.content,
            status: 'writing'
          })
        })
      }

      if (state.outline) {
        const newOutlineChapters = chapters.map((ch) => ({
          number: ch.number,
          title: ch.title,
          summary: ch.content.substring(0, 200) + '...',
          keyPoints: [],
          sections: []
        }))

        await fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            outline: {
              ...state.outline,
              chapters: newOutlineChapters
            }
          })
        })
      }

      closeImportModal()
      await loadProjectData()
    } catch {
      setError('챕터 가져오기에 실패했습니다.')
    } finally {
      setIsImporting(false)
    }
  }

  const closeImportModal = () => {
    setShowImportModal(false)
    setImportStep('upload')
    setParsedFile(null)
  }

  const allChaptersDone = (): boolean => {
    if (!state.outline) return false
    return state.outline.chapters.every(ch => {
      const chapter = state.chapters.get(ch.number)
      return chapter && chapter.content && chapter.content.length > 2000
    })
  }

  const currentChapter = getCurrentChapter()
  const currentChapterOutline = getCurrentChapterOutline()
  const displayContent = state.isWriting ? state.streamingContent : (currentChapter?.content || '')

  return (
    <div className="min-h-screen flex flex-col">
      <StageHeader
        title="집필"
        description="각 챕터를 작성합니다"
        stage="write"
        onPrevious={handlePreviousStage}
        onNext={allChaptersDone() ? handleNextStage : undefined}
        nextLabel="편집으로"
        previousLabel="목차로"
      >
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {isSaving ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              저장 중...
            </>
          ) : lastSaved ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-500" />
              {lastSaved.toLocaleTimeString()} 저장됨
            </>
          ) : null}
        </div>

        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={() => setEditorMode('chapter')}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
              editorMode === 'chapter'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            title="챕터 모드"
          >
            <Bars3Icon className="w-4 h-4" />
            챕터
          </button>
          <button
            onClick={() => setEditorMode('page')}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
              editorMode === 'page'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            title="페이지 모드"
          >
            <Squares2X2Icon className="w-4 h-4" />
            페이지
          </button>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50"
        >
          <DocumentArrowUpIcon className="w-4 h-4" />
          파일 가져오기
        </button>
        <button
          onClick={handleManualSave}
          className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          저장
        </button>
      </StageHeader>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {editorMode === 'chapter' ? (
          <>
            {state.outline && (
              <ChapterList
                chapters={state.outline.chapters}
                chapterContents={state.chapters}
                currentChapter={state.currentChapter}
                onChapterSelect={handleChapterSelect}
              />
            )}

            <ChapterEditor
              chapterOutline={currentChapterOutline}
              content={displayContent}
              isWriting={state.isWriting}
              currentChapter={state.currentChapter}
              totalChapters={state.outline?.chapters.length || 0}
              onContentChange={handleContentChange}
              onAIWrite={handleAIWrite}
              onPreviousChapter={handlePreviousChapter}
              onNextChapter={handleNextChapter}
            />
          </>
        ) : (
          <>
            {state.outline && (
              <div className="w-48 bg-gray-50 border-r overflow-y-auto">
                <div className="p-3 border-b bg-white">
                  <h3 className="font-medium text-sm text-gray-700">챕터 목록</h3>
                </div>
                {state.outline.chapters.map((ch) => {
                  const chapter = state.chapters.get(ch.number)
                  const hasContent = chapter && chapter.content && chapter.content.length > 0
                  const isComplete = chapter && chapter.content && chapter.content.length > 2000

                  return (
                    <button
                      key={ch.number}
                      onClick={() => handleChapterSelect(ch.number)}
                      className={`w-full text-left px-3 py-2 text-sm border-b transition-colors ${
                        state.currentChapter === ch.number
                          ? 'bg-blue-50 border-l-2 border-l-blue-500'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          isComplete
                            ? 'bg-green-100 text-green-700'
                            : hasContent
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {ch.number}
                        </span>
                        <span className="truncate">{ch.title}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {chapterId && currentChapterOutline && (
              <PageEditor
                projectId={projectId}
                chapterId={chapterId}
                chapterNumber={state.currentChapter}
                chapterTitle={currentChapterOutline.title}
                chapterOutline={currentChapterOutline}
                initialContent={currentChapter?.content || ''}
                onSave={handlePageSave}
                onAIGenerate={handlePageAIGenerate}
              />
            )}

            {!chapterId && (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                챕터를 선택해주세요
              </div>
            )}
          </>
        )}
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                파일에서 챕터 가져오기
              </h2>
              <button
                onClick={closeImportModal}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              {importStep === 'upload' && (
                <>
                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    원고 파일을 업로드하면 기존 챕터를 대체하거나 추가할 수 있습니다.
                  </p>
                  <FileUploader
                    onFileLoaded={handleFileLoaded}
                    onCancel={closeImportModal}
                  />
                </>
              )}

              {importStep === 'split' && parsedFile && (
                <ChapterSplitter
                  parsedFile={parsedFile}
                  onConfirm={handleImportChapters}
                  onCancel={closeImportModal}
                  isProcessing={isImporting}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
