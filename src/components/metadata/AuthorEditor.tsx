'use client'

import { useState } from 'react'
import { Author, AuthorRole } from '@/types/book'

interface AuthorEditorProps {
  authors: Author[]
  onChange: (authors: Author[]) => void
}

const ROLE_LABELS: Record<AuthorRole, string> = {
  author: '저자',
  'co-author': '공동저자',
  editor: '편집자',
  translator: '번역자',
  illustrator: '삽화가',
}

export default function AuthorEditor({ authors, onChange }: AuthorEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const addAuthor = () => {
    const newAuthor: Author = {
      name: '',
      role: 'author',
    }
    onChange([...authors, newAuthor])
    setEditingIndex(authors.length)
  }

  const updateAuthor = (index: number, updates: Partial<Author>) => {
    const updated = authors.map((author, i) =>
      i === index ? { ...author, ...updates } : author
    )
    onChange(updated)
  }

  const removeAuthor = (index: number) => {
    onChange(authors.filter((_, i) => i !== index))
    setEditingIndex(null)
  }

  const moveAuthor = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= authors.length) return

    const updated = [...authors]
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          저자/기여자
        </h3>
        <button
          type="button"
          onClick={addAuthor}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          추가
        </button>
      </div>

      {authors.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center border border-dashed border-neutral-300 dark:border-neutral-700">
          저자 정보가 없습니다. 추가 버튼을 눌러 저자를 등록하세요.
        </p>
      ) : (
        <div className="space-y-3">
          {authors.map((author, index) => (
            <div
              key={index}
              className={`border transition-colors ${
                editingIndex === index
                  ? 'border-neutral-400 dark:border-neutral-500 bg-neutral-50 dark:bg-neutral-800/50'
                  : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              {editingIndex === index ? (
                // 편집 모드
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        이름 *
                      </label>
                      <input
                        type="text"
                        value={author.name}
                        onChange={(e) => updateAuthor(index, { name: e.target.value })}
                        placeholder="저자 이름"
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        역할
                      </label>
                      <select
                        value={author.role}
                        onChange={(e) => updateAuthor(index, { role: e.target.value as AuthorRole })}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                      >
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                      소개
                    </label>
                    <textarea
                      value={author.bio || ''}
                      onChange={(e) => updateAuthor(index, { bio: e.target.value })}
                      placeholder="저자 소개 (선택)"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        이메일
                      </label>
                      <input
                        type="email"
                        value={author.email || ''}
                        onChange={(e) => updateAuthor(index, { email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        웹사이트
                      </label>
                      <input
                        type="url"
                        value={author.website || ''}
                        onChange={(e) => updateAuthor(index, { website: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      삭제
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="px-3 py-1.5 text-xs bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
                    >
                      완료
                    </button>
                  </div>
                </div>
              ) : (
                // 표시 모드
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveAuthor(index, 'up')}
                        disabled={index === 0}
                        className="p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveAuthor(index, 'down')}
                        disabled={index === authors.length - 1}
                        className="p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {author.name || '(이름 없음)'}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {ROLE_LABELS[author.role]}
                        {author.bio && ` · ${author.bio.substring(0, 30)}...`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(index)}
                    className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    편집
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
