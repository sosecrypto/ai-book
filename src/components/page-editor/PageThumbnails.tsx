'use client'

import { useMemo } from 'react'
import { DocumentTextIcon, CheckIcon, PencilIcon } from '@heroicons/react/24/outline'
import type { Page, PageStatus } from '@/types/book'

interface PageThumbnailsProps {
  pages: Page[]
  currentPage: number
  onPageSelect: (pageNumber: number) => void
}

function getStatusIcon(status: PageStatus) {
  switch (status) {
    case 'complete':
      return <CheckIcon className="w-3 h-3 text-green-500" />
    case 'draft':
      return <PencilIcon className="w-3 h-3 text-blue-500" />
    default:
      return <DocumentTextIcon className="w-3 h-3 text-gray-400" />
  }
}

function getStatusColor(status: PageStatus) {
  switch (status) {
    case 'complete':
      return 'border-green-400 bg-green-50'
    case 'draft':
      return 'border-blue-400 bg-blue-50'
    default:
      return 'border-gray-200 bg-gray-50'
  }
}

export default function PageThumbnails({
  pages,
  currentPage,
  onPageSelect,
}: PageThumbnailsProps) {
  const sortedPages = useMemo(
    () => [...pages].sort((a, b) => a.pageNumber - b.pageNumber),
    [pages]
  )

  return (
    <div className="w-32 bg-gray-100 border-r overflow-y-auto p-2 flex flex-col gap-2">
      <div className="text-xs font-medium text-gray-500 px-1 py-2">
        페이지 ({pages.length})
      </div>

      {sortedPages.map((page) => {
        const isActive = page.pageNumber === currentPage
        const preview = page.content.substring(0, 50).replace(/\n/g, ' ') || '빈 페이지'

        return (
          <button
            key={page.id || page.pageNumber}
            onClick={() => onPageSelect(page.pageNumber)}
            className={`relative w-full aspect-[3/4] rounded border-2 p-2 text-left transition-all ${
              isActive
                ? 'border-blue-500 ring-2 ring-blue-200'
                : getStatusColor(page.status)
            } hover:border-blue-400`}
          >
            <div className="absolute top-1 left-1 flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-600">
                {page.pageNumber}
              </span>
              {getStatusIcon(page.status)}
            </div>

            <div className="mt-4 text-[8px] text-gray-500 line-clamp-4 leading-tight overflow-hidden">
              {preview}
            </div>

            {page.wordCount > 0 && (
              <div className="absolute bottom-1 right-1 text-[8px] text-gray-400">
                {page.wordCount}w
              </div>
            )}
          </button>
        )
      })}

      <button
        onClick={() => onPageSelect(pages.length + 1)}
        className="w-full aspect-[3/4] rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
      >
        <span className="text-2xl">+</span>
      </button>
    </div>
  )
}
