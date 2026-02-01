'use client'

import { useRef, useEffect } from 'react'
import { countWords } from '@/lib/page-utils'

interface PageContentProps {
  content: string
  onChange: (content: string) => void
  isGenerating: boolean
  streamingContent?: string
  zoom: number
  readOnly?: boolean
}

export default function PageContent({
  content,
  onChange,
  isGenerating,
  streamingContent,
  zoom,
  readOnly = false,
}: PageContentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const displayContent = isGenerating && streamingContent ? streamingContent : content

  useEffect(() => {
    if (isGenerating && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [streamingContent, isGenerating])

  const wordCount = countWords(displayContent)
  const charCount = displayContent.length
  const targetWords = 400
  const progress = Math.min((wordCount / targetWords) * 100, 100)

  const fontSize = Math.round(16 * (zoom / 100))
  const lineHeight = Math.round(28 * (zoom / 100))

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={displayContent}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly || isGenerating}
          className={`w-full h-full resize-none border-0 focus:outline-none focus:ring-0 p-8 bg-white ${
            isGenerating ? 'text-gray-600' : 'text-gray-900'
          }`}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeight}px`,
            fontFamily: "'Noto Serif KR', serif",
          }}
          placeholder="이 페이지에 내용을 작성하세요..."
        />
        {isGenerating && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-purple-600 text-sm">
            <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span>AI가 작성 중입니다...</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t text-sm">
        <div className="flex items-center gap-4 text-gray-500">
          <span>{charCount.toLocaleString()}자</span>
          <span>{wordCount.toLocaleString()}단어</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-gray-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-gray-500">
            {progress >= 100 ? '완료' : `${Math.round(progress)}%`}
          </span>
        </div>
      </div>
    </div>
  )
}
