'use client'

import { useState } from 'react'
import type { BookProject } from '@/types/book'
import { BookCover } from './BookCover'
import { TableOfContents } from './TableOfContents'
import { ChapterView } from './ChapterView'
import { CoverDesigner } from '../CoverDesigner'

type ViewMode = 'cover' | 'toc' | 'chapter'

interface BookPreviewProps {
  project: BookProject
  coverImageUrl?: string
  onDownloadPDF: () => void
  onEdit: () => void
  onCoverUpdate?: (imageUrl: string, template?: string, prompt?: string) => void
}

export function BookPreview({
  project,
  coverImageUrl,
  onDownloadPDF,
  onEdit,
  onCoverUpdate,
}: BookPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('cover')
  const [currentChapter, setCurrentChapter] = useState<number | null>(null)
  const [showCoverDesigner, setShowCoverDesigner] = useState(false)
  const [localCoverUrl, setLocalCoverUrl] = useState<string | undefined>(coverImageUrl)

  const handleOpenBook = () => {
    setViewMode('toc')
  }

  const handleCoverSave = (imageUrl: string, template?: string, prompt?: string) => {
    setLocalCoverUrl(imageUrl)
    setShowCoverDesigner(false)
    onCoverUpdate?.(imageUrl, template, prompt)
  }

  const handleSelectChapter = (chapterNumber: number) => {
    const chapter = project.chapters.find((ch) => ch.number === chapterNumber)
    if (chapter) {
      setCurrentChapter(chapterNumber)
      setViewMode('chapter')
    }
  }

  const handleBackToToc = () => {
    setViewMode('toc')
    setCurrentChapter(null)
  }

  const handlePreviousChapter = () => {
    if (currentChapter && currentChapter > 1) {
      const prevChapter = project.chapters.find((ch) => ch.number === currentChapter - 1)
      if (prevChapter) {
        setCurrentChapter(prevChapter.number)
      }
    }
  }

  const handleNextChapter = () => {
    const maxChapter = Math.max(...project.chapters.map((ch) => ch.number))
    if (currentChapter && currentChapter < maxChapter) {
      const nextChapter = project.chapters.find((ch) => ch.number === currentChapter + 1)
      if (nextChapter) {
        setCurrentChapter(nextChapter.number)
      }
    }
  }

  const selectedChapter = currentChapter
    ? project.chapters.find((ch) => ch.number === currentChapter)
    : null

  const chapterOutline = currentChapter
    ? project.outline?.chapters.find((ch) => ch.number === currentChapter)
    : undefined

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {viewMode !== 'cover' && (
              <button
                onClick={() => setViewMode('cover')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                표지
              </button>
            )}
            <h1 className="text-xl font-bold text-white">{project.title}</h1>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                project.status === 'completed'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {project.status === 'completed' ? '완료' : '작성 중'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCoverDesigner(true)}
              className="px-4 py-2 text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              표지 디자인
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              편집
            </button>
            <button
              onClick={onDownloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF 다운로드
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-12">
        {viewMode === 'cover' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <BookCover
              project={project}
              coverImageUrl={localCoverUrl}
              onClick={handleOpenBook}
            />
          </div>
        )}

        {viewMode === 'toc' && (
          <div className="max-w-2xl mx-auto">
            <TableOfContents
              outline={project.outline}
              chapters={project.chapters}
              currentChapter={currentChapter}
              onSelectChapter={handleSelectChapter}
            />
          </div>
        )}

        {viewMode === 'chapter' && selectedChapter && (
          <div className="max-w-4xl mx-auto">
            <ChapterView
              chapter={selectedChapter}
              chapterOutline={chapterOutline}
              totalChapters={project.outline?.chapters.length ?? project.chapters.length}
              onPrevious={currentChapter && currentChapter > 1 ? handlePreviousChapter : undefined}
              onNext={
                currentChapter &&
                currentChapter < Math.max(...project.chapters.map((ch) => ch.number))
                  ? handleNextChapter
                  : undefined
              }
              onBackToToc={handleBackToToc}
            />
          </div>
        )}
      </main>

      {/* Cover Designer Modal */}
      {showCoverDesigner && (
        <CoverDesigner
          project={project}
          onSave={handleCoverSave}
          onCancel={() => setShowCoverDesigner(false)}
        />
      )}
    </div>
  )
}
