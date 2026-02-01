'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface PageNavigatorProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function PageNavigator({
  currentPage,
  totalPages,
  onPageChange,
}: PageNavigatorProps) {
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      onPageChange(value)
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="이전 페이지 (PageUp)"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 text-sm">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={handleInputChange}
          className="w-12 text-center border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500">/</span>
        <span className="text-gray-600">{totalPages}</span>
      </div>

      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="다음 페이지 (PageDown)"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  )
}
