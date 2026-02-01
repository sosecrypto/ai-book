'use client'

import { MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, Squares2X2Icon, RectangleGroupIcon, Bars3Icon, CheckIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import type { PageViewMode, PaperSize } from '@/types/book'
import { PAPER_SIZES } from '@/types/book'

interface PageToolbarProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  viewMode: PageViewMode
  onViewModeChange: (mode: PageViewMode) => void
  paperSize: PaperSize
  onPaperSizeChange: (size: PaperSize) => void
  isSaving: boolean
  lastSaved: Date | null
  isDirty: boolean
  onSave: () => void
}

export default function PageToolbar({
  zoom,
  onZoomChange,
  viewMode,
  onViewModeChange,
  paperSize,
  onPaperSizeChange,
  isSaving,
  lastSaved,
  isDirty,
  onSave,
}: PageToolbarProps) {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 10, 200))
  }

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 10, 30))
  }

  const viewModes: { mode: PageViewMode; icon: typeof Squares2X2Icon; label: string }[] = [
    { mode: 'single', icon: Squares2X2Icon, label: '단일 페이지' },
    { mode: 'spread', icon: RectangleGroupIcon, label: '양면 펼침' },
    { mode: 'continuous', icon: Bars3Icon, label: '연속 스크롤' },
  ]

  const paperSizeOptions: PaperSize[] = ['a4', 'a5', 'b5', 'letter', 'novel']

  const formatLastSaved = (date: Date | null): string => {
    if (!date) return '저장되지 않음'
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return '방금 저장됨'
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전 저장`
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
      <div className="flex items-center gap-3">
        {/* 용지 크기 선택 */}
        <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
          <DocumentIcon className="w-4 h-4 text-gray-500" />
          <select
            value={paperSize}
            onChange={(e) => onPaperSizeChange(e.target.value as PaperSize)}
            className="text-sm bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer"
          >
            {paperSizeOptions.map((size) => (
              <option key={size} value={size}>
                {PAPER_SIZES[size].name}
              </option>
            ))}
          </select>
        </div>

        {/* 확대/축소 */}
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 30}
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="축소"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </button>
          <span className="w-14 text-center text-sm font-medium">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="확대"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* 보기 모드 */}
        <div className="flex items-center gap-1 border rounded-lg p-1">
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`p-1.5 rounded transition-colors ${
                viewMode === mode
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100'
              }`}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {formatLastSaved(lastSaved)}
        </span>

        <button
          onClick={onSave}
          disabled={isSaving || !isDirty}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            isDirty
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSaving ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span>저장 중...</span>
            </>
          ) : isDirty ? (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>저장</span>
            </>
          ) : (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>저장됨</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
