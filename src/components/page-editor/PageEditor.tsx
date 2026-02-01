'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import PageToolbar from './PageToolbar'
import PageThumbnails from './PageThumbnails'
import PageCanvas from './PageCanvas'
import { splitChapterToPages, countWords, getPageStatus } from '@/lib/page-utils'
import type { Page, PageViewMode, PageEditorState, PageGenerateMode, ChapterOutline, PaperSize } from '@/types/book'

interface PageEditorProps {
  projectId: string
  chapterId: string
  chapterNumber: number
  chapterTitle: string
  chapterOutline?: ChapterOutline
  initialContent: string
  onSave: (content: string) => Promise<void>
  onAIGenerate: (mode: PageGenerateMode, pageNumber: number, context: string) => Promise<void>
}

export default function PageEditor({
  projectId,
  chapterId,
  chapterNumber,
  chapterTitle,
  chapterOutline,
  initialContent,
  onSave,
  onAIGenerate,
}: PageEditorProps) {
  const [state, setState] = useState<PageEditorState>(() => {
    const initialPages = splitChapterToPages(initialContent).map((p, idx) => ({
      ...p,
      id: `temp-${idx}`,
      chapterId,
    }))
    return {
      pages: initialPages,
      currentPage: 1,
      totalPages: initialPages.length,
      zoom: 80,
      viewMode: 'single' as PageViewMode,
      paperSize: 'a4' as PaperSize,
      isDirty: false,
      lastSaved: null,
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const mergePagesContent = useCallback(() => {
    return state.pages
      .slice()
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .map((p) => p.content)
      .filter((c) => c.trim())
      .join('\n\n')
  }, [state.pages])

  const saveContent = useCallback(async () => {
    if (!state.isDirty) return

    setIsSaving(true)
    try {
      const content = mergePagesContent()
      await onSave(content)
      setState((prev) => ({
        ...prev,
        isDirty: false,
        lastSaved: new Date(),
      }))
    } catch {
      // 저장 실패 시 상태 유지 (다음 저장 시 재시도)
    } finally {
      setIsSaving(false)
    }
  }, [state.isDirty, mergePagesContent, onSave])

  useEffect(() => {
    if (state.isDirty) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveContent()
      }, 1000)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [state.isDirty, saveContent])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        saveContent()
      }
      if (e.key === 'PageUp') {
        e.preventDefault()
        handlePageChange(Math.max(1, state.currentPage - 1))
      }
      if (e.key === 'PageDown') {
        e.preventDefault()
        handlePageChange(Math.min(state.totalPages, state.currentPage + 1))
      }
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault()
        const currentPageData = state.pages.find((p) => p.pageNumber === state.currentPage)
        handleGenerate({ mode: currentPageData?.content.trim() ? 'continue' : 'new' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.currentPage, state.totalPages, state.pages, saveContent])

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > state.pages.length) {
      const newPage: Page = {
        id: `temp-new-${Date.now()}`,
        chapterId,
        pageNumber,
        content: '',
        status: 'empty',
        wordCount: 0,
      }
      setState((prev) => ({
        ...prev,
        pages: [...prev.pages, newPage],
        currentPage: pageNumber,
        totalPages: pageNumber,
        isDirty: true,
      }))
    } else {
      setState((prev) => ({
        ...prev,
        currentPage: pageNumber,
      }))
    }
  }

  const handleContentChange = (pageNumber: number, content: string) => {
    setState((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.pageNumber === pageNumber
          ? {
              ...p,
              content,
              wordCount: countWords(content),
              status: getPageStatus(content),
            }
          : p
      ),
      isDirty: true,
    }))
  }

  const handleZoomChange = (zoom: number) => {
    setState((prev) => ({ ...prev, zoom }))
  }

  const handleViewModeChange = (viewMode: PageViewMode) => {
    setState((prev) => ({ ...prev, viewMode }))
  }

  const handlePaperSizeChange = (paperSize: PaperSize) => {
    setState((prev) => ({ ...prev, paperSize }))
  }

  const handleGenerate = async (mode: PageGenerateMode) => {
    setIsGenerating(true)
    setStreamingContent('')

    try {
      const previousPages = state.pages
        .filter((p) => p.pageNumber < state.currentPage)
        .sort((a, b) => b.pageNumber - a.pageNumber)
        .slice(0, 2)
        .map((p) => p.content)
        .reverse()
        .join('\n\n')

      const outlineContext = chapterOutline
        ? `챕터 ${chapterNumber}: ${chapterTitle}\n개요: ${chapterOutline.summary}\n핵심 포인트: ${chapterOutline.keyPoints.join(', ')}`
        : `챕터 ${chapterNumber}: ${chapterTitle}`

      const context = `${outlineContext}\n\n이전 내용:\n${previousPages}`

      await onAIGenerate(mode, state.currentPage, context)
    } catch {
      // 생성 실패 시 상태 복원 (isGenerating이 finally에서 false로 설정됨)
    } finally {
      setIsGenerating(false)
      setStreamingContent('')
    }
  }

  const handleManualSave = () => {
    saveContent()
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <PageToolbar
        zoom={state.zoom}
        onZoomChange={handleZoomChange}
        viewMode={state.viewMode}
        onViewModeChange={handleViewModeChange}
        paperSize={state.paperSize}
        onPaperSizeChange={handlePaperSizeChange}
        isSaving={isSaving}
        lastSaved={state.lastSaved}
        isDirty={state.isDirty}
        onSave={handleManualSave}
      />

      <div className="flex-1 flex overflow-hidden">
        <PageThumbnails
          pages={state.pages}
          currentPage={state.currentPage}
          onPageSelect={handlePageChange}
        />

        <PageCanvas
          pages={state.pages}
          currentPage={state.currentPage}
          onPageChange={handlePageChange}
          onContentChange={handleContentChange}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          streamingContent={streamingContent}
          zoom={state.zoom}
          viewMode={state.viewMode}
          paperSize={state.paperSize}
          chapterTitle={`챕터 ${chapterNumber}: ${chapterTitle}`}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2 bg-white border-t text-sm text-gray-500">
        <span>
          챕터 {chapterNumber} · {state.pages.length}페이지 · {state.pages.reduce((sum, p) => sum + p.wordCount, 0).toLocaleString()}단어
        </span>
        <div className="flex items-center gap-4">
          <span>Ctrl+S: 저장</span>
          <span>PageUp/Down: 페이지 이동</span>
          <span>Ctrl+G: AI 생성</span>
        </div>
      </div>
    </div>
  )
}
