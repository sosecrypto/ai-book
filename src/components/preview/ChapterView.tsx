'use client'

import type { Chapter, ChapterOutline } from '@/types/book'

interface ChapterViewProps {
  chapter: Chapter
  chapterOutline?: ChapterOutline
  totalChapters: number
  onPrevious?: () => void
  onNext?: () => void
  onBackToToc: () => void
}

export function ChapterView({
  chapter,
  chapterOutline,
  totalChapters,
  onPrevious,
  onNext,
  onBackToToc,
}: ChapterViewProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBackToToc}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목차로
        </button>
        <span className="text-gray-400 text-sm">
          {chapter.number} / {totalChapters}
        </span>
      </div>

      {/* Chapter title */}
      <div className="mb-8">
        <p className="text-blue-400 text-sm uppercase tracking-wider mb-2">
          Chapter {chapter.number}
        </p>
        <h1 className="text-3xl font-bold text-white">{chapter.title}</h1>
        {chapterOutline?.summary && (
          <p className="text-gray-400 mt-2 italic">{chapterOutline.summary}</p>
        )}
      </div>

      {/* Content */}
      <div className="prose prose-invert prose-lg max-w-none">
        <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
          {chapter.content}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-700">
        <button
          onClick={onPrevious}
          disabled={!onPrevious}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            onPrevious
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          이전 챕터
        </button>

        <button
          onClick={onNext}
          disabled={!onNext}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            onNext
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          다음 챕터
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
