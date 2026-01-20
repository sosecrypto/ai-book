'use client'

import type { CoverTemplate } from '@/lib/cover-templates'

interface TemplatePreviewProps {
  template: CoverTemplate
  title: string
  selected: boolean
  onClick: () => void
}

export function TemplatePreview({ template, title, selected, onClick }: TemplatePreviewProps) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg overflow-hidden transition-all ${
        selected
          ? 'ring-4 ring-blue-500 scale-105'
          : 'ring-1 ring-gray-600 hover:ring-gray-500'
      }`}
    >
      {/* Cover preview */}
      <div
        className={`w-32 h-48 bg-gradient-to-br ${template.previewGradient} flex flex-col items-center justify-center p-4`}
      >
        <div
          className={`text-center ${
            template.previewGradient.includes('gray-100')
              ? 'text-gray-800'
              : 'text-white'
          }`}
          style={{ fontFamily: template.fontFamily }}
        >
          {template.titlePosition === 'top' && (
            <div className="mt-2 mb-auto">
              <p className="text-xs opacity-70 uppercase tracking-wider mb-1">Book</p>
              <p className="text-sm font-bold line-clamp-2">{title}</p>
            </div>
          )}

          {template.titlePosition === 'center' && (
            <div>
              <p className="text-sm font-bold line-clamp-3">{title}</p>
            </div>
          )}

          {template.titlePosition === 'bottom' && (
            <div className="mt-auto mb-2">
              <p className="text-sm font-bold line-clamp-2">{title}</p>
            </div>
          )}
        </div>

        {/* Accent decoration */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: template.accentColor }}
        />
      </div>

      {/* Template name */}
      <div className="p-2 bg-gray-800">
        <p className="text-xs font-medium text-white">{template.name}</p>
        <p className="text-xs text-gray-400">{template.description}</p>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  )
}
