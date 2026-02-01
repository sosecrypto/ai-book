'use client'

import { useMemo } from 'react'
import PageContent from './PageContent'
import PageNavigator from './PageNavigator'
import AIGenerateButton from './AIGenerateButton'
import type { Page, PageViewMode, PageGenerateMode, PaperSize } from '@/types/book'
import { PAPER_SIZES } from '@/types/book'

interface PageCanvasProps {
  pages: Page[]
  currentPage: number
  onPageChange: (pageNumber: number) => void
  onContentChange: (pageNumber: number, content: string) => void
  onGenerate: (mode: PageGenerateMode) => void
  isGenerating: boolean
  streamingContent?: string
  zoom: number
  viewMode: PageViewMode
  paperSize: PaperSize
  chapterTitle: string
}

export default function PageCanvas({
  pages,
  currentPage,
  onPageChange,
  onContentChange,
  onGenerate,
  isGenerating,
  streamingContent,
  zoom,
  viewMode,
  paperSize,
  chapterTitle,
}: PageCanvasProps) {
  const currentPageData = useMemo(
    () => pages.find((p) => p.pageNumber === currentPage),
    [pages, currentPage]
  )

  const paper = PAPER_SIZES[paperSize]
  const scale = zoom / 100

  // 양면 펼침에서 현재 페이지가 홀수면 왼쪽, 짝수면 오른쪽
  const spreadPages = useMemo(() => {
    if (viewMode !== 'spread') return { left: null, right: null }

    // 홀수 페이지가 왼쪽, 짝수 페이지가 오른쪽
    const leftPageNum = currentPage % 2 === 1 ? currentPage : currentPage - 1
    const rightPageNum = leftPageNum + 1

    return {
      left: pages.find((p) => p.pageNumber === leftPageNum) || null,
      right: pages.find((p) => p.pageNumber === rightPageNum) || null,
    }
  }, [pages, currentPage, viewMode])

  const handleContentChange = (content: string) => {
    onContentChange(currentPage, content)
  }

  // 페이지 스타일 계산
  const pageStyle = {
    width: `${paper.width}px`,
    height: `${paper.height}px`,
  }

  // 단일 페이지 렌더링
  const renderSinglePage = (page: Page | null | undefined, pageNumber: number, isActive: boolean) => {
    if (!page && pageNumber > pages.length) {
      // 새 페이지 추가 버튼
      return (
        <div
          style={pageStyle}
          className="bg-white shadow-2xl border border-gray-300 flex flex-col"
        >
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => onPageChange(pageNumber)}
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <div className="text-center">
                <span className="text-4xl block mb-2">+</span>
                <span className="text-sm">새 페이지 추가</span>
              </div>
            </button>
          </div>
        </div>
      )
    }

    const content = page?.content || ''
    const showAIButton = isActive

    return (
      <div
        style={pageStyle}
        className="bg-white shadow-2xl border border-gray-300 flex flex-col overflow-hidden"
      >
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b shrink-0">
          <span className="text-sm font-medium text-gray-700">
            {pageNumber}
          </span>
          {showAIButton && (
            <AIGenerateButton
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              hasContent={!!content.trim()}
            />
          )}
        </div>

        {/* 페이지 콘텐츠 */}
        <div className="flex-1 overflow-hidden">
          <PageContent
            content={content}
            onChange={(newContent) => onContentChange(pageNumber, newContent)}
            isGenerating={isGenerating && isActive}
            streamingContent={isActive ? streamingContent : undefined}
            zoom={100}
          />
        </div>

        {/* 페이지 푸터 */}
        <div className="px-4 py-1 bg-gray-50 border-t text-center shrink-0">
          <span className="text-xs text-gray-400">{pageNumber}</span>
        </div>
      </div>
    )
  }

  // 연속 스크롤 모드
  if (viewMode === 'continuous') {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-300 p-8">
        <div
          className="mx-auto space-y-8"
          style={{
            width: `${paper.width * scale}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {pages.map((page) => (
            <div
              key={page.id || page.pageNumber}
              id={`page-${page.pageNumber}`}
              onClick={() => onPageChange(page.pageNumber)}
              className={`cursor-pointer transition-all ${
                page.pageNumber === currentPage ? 'ring-4 ring-blue-400' : ''
              }`}
            >
              {renderSinglePage(page, page.pageNumber, page.pageNumber === currentPage)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 양면 펼침 모드
  if (viewMode === 'spread') {
    return (
      <div className="flex-1 flex flex-col bg-gray-300">
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <div
            className="flex gap-1 bg-gray-800 p-4 rounded-lg shadow-2xl"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            {/* 왼쪽 페이지 (홀수) */}
            <div
              onClick={() => spreadPages.left && onPageChange(spreadPages.left.pageNumber)}
              className={`cursor-pointer transition-all ${
                spreadPages.left?.pageNumber === currentPage ? 'ring-4 ring-blue-400' : ''
              }`}
            >
              {renderSinglePage(
                spreadPages.left,
                spreadPages.left?.pageNumber || 1,
                spreadPages.left?.pageNumber === currentPage
              )}
            </div>

            {/* 오른쪽 페이지 (짝수) */}
            <div
              onClick={() => {
                if (spreadPages.right) {
                  onPageChange(spreadPages.right.pageNumber)
                } else if (spreadPages.left) {
                  onPageChange(spreadPages.left.pageNumber + 1)
                }
              }}
              className={`cursor-pointer transition-all ${
                spreadPages.right?.pageNumber === currentPage ? 'ring-4 ring-blue-400' : ''
              }`}
            >
              {renderSinglePage(
                spreadPages.right,
                spreadPages.right?.pageNumber || (spreadPages.left?.pageNumber || 0) + 1,
                spreadPages.right?.pageNumber === currentPage
              )}
            </div>
          </div>
        </div>

        <PageNavigator
          currentPage={currentPage}
          totalPages={Math.max(pages.length, 1)}
          onPageChange={onPageChange}
        />
      </div>
    )
  }

  // 단일 페이지 모드
  return (
    <div className="flex-1 flex flex-col bg-gray-300">
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {renderSinglePage(currentPageData, currentPage, true)}
        </div>
      </div>

      <PageNavigator
        currentPage={currentPage}
        totalPages={Math.max(pages.length, 1)}
        onPageChange={onPageChange}
      />
    </div>
  )
}
