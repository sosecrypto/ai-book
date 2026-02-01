'use client'

import { useState } from 'react'
import { SparklesIcon, ChevronDownIcon, PencilIcon, ArrowPathIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import type { PageGenerateMode } from '@/types/book'

interface AIGenerateButtonProps {
  onGenerate: (mode: PageGenerateMode) => void
  isGenerating: boolean
  hasContent: boolean
}

export default function AIGenerateButton({
  onGenerate,
  isGenerating,
  hasContent,
}: AIGenerateButtonProps) {
  const [showMenu, setShowMenu] = useState(false)

  const modes = [
    {
      mode: 'new' as const,
      label: '새로 작성',
      description: '빈 페이지에 새 콘텐츠 생성',
      icon: PencilIcon,
      disabled: hasContent,
    },
    {
      mode: 'continue' as const,
      label: '이어서 작성',
      description: '이전 내용에 이어서 작성',
      icon: ArrowRightIcon,
      disabled: false,
    },
    {
      mode: 'rewrite' as const,
      label: '다시 작성',
      description: '기존 내용을 개선하여 재작성',
      icon: ArrowPathIcon,
      disabled: !hasContent,
    },
  ]

  const handleModeSelect = (mode: PageGenerateMode['mode']) => {
    setShowMenu(false)
    onGenerate({ mode })
  }

  if (isGenerating) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg"
      >
        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <span>생성 중...</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <SparklesIcon className="w-4 h-4" />
        <span>AI 작성</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
            {modes.map(({ mode, label, description, icon: Icon, disabled }) => (
              <button
                key={mode}
                onClick={() => !disabled && handleModeSelect(mode)}
                disabled={disabled}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Icon className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-gray-500">{description}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
