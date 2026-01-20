'use client'

import type { BookOutline, Chapter } from '@/types/book'

interface TableOfContentsProps {
  outline: BookOutline | null
  chapters: Chapter[]
  currentChapter: number | null
  onSelectChapter: (chapterNumber: number) => void
}

export function TableOfContents({
  outline,
  chapters,
  currentChapter,
  onSelectChapter,
}: TableOfContentsProps) {
  if (!outline) {
    return (
      <div className="text-center text-gray-400 py-8">
        아직 목차가 생성되지 않았습니다.
      </div>
    )
  }

  const getChapterStatus = (number: number) => {
    const chapter = chapters.find((ch) => ch.number === number)
    if (!chapter) return 'pending'
    return chapter.status
  }

  const statusIcons: Record<string, string> = {
    pending: '○',
    writing: '◐',
    editing: '◑',
    reviewing: '◕',
    approved: '●',
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">목차</h2>

      <div className="space-y-2">
        {outline.chapters.map((chapterOutline) => {
          const status = getChapterStatus(chapterOutline.number)
          const isActive = currentChapter === chapterOutline.number
          const hasContent = chapters.some((ch) => ch.number === chapterOutline.number)

          return (
            <button
              key={chapterOutline.number}
              onClick={() => onSelectChapter(chapterOutline.number)}
              className={`w-full text-left p-4 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600/30 border border-blue-500'
                  : hasContent
                  ? 'bg-gray-700/50 hover:bg-gray-700'
                  : 'bg-gray-800/30 hover:bg-gray-700/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">{statusIcons[status]}</span>
                <span className="text-gray-400 text-sm">
                  Chapter {chapterOutline.number}
                </span>
              </div>
              <h3 className={`font-medium mt-1 ${isActive ? 'text-blue-400' : 'text-white'}`}>
                {chapterOutline.title}
              </h3>
              {chapterOutline.summary && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {chapterOutline.summary}
                </p>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>총 {outline.chapters.length}개 챕터</span>
          <span>작성 완료: {chapters.length}개</span>
        </div>
      </div>
    </div>
  )
}
