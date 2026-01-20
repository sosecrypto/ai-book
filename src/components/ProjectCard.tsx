'use client'

import type { BookProject, BookStatus } from '@/types/book'

interface ProjectCardProps {
  project: BookProject
  onSelect: (project: BookProject) => void
  onDelete: (id: string) => void
}

const statusConfig: Record<BookStatus, { label: string; color: string }> = {
  draft: { label: '초안', color: 'bg-gray-500' },
  researching: { label: '리서치 중', color: 'bg-blue-500' },
  outlining: { label: '개요 작성 중', color: 'bg-purple-500' },
  writing: { label: '집필 중', color: 'bg-yellow-500' },
  editing: { label: '편집 중', color: 'bg-orange-500' },
  reviewing: { label: '검토 중', color: 'bg-pink-500' },
  completed: { label: '완료', color: 'bg-green-500' },
}

const typeLabels: Record<string, string> = {
  fiction: '소설',
  nonfiction: '논픽션',
  selfhelp: '자기계발',
  technical: '기술서',
  essay: '에세이',
  children: '아동도서',
  poetry: '시집',
}

export function ProjectCard({ project, onSelect, onDelete }: ProjectCardProps) {
  const status = statusConfig[project.status]
  const chapterCount = project.chapters?.length ?? 0
  const outlineChapters = project.outline?.chapters?.length ?? 0

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="group relative rounded-lg border border-gray-700 bg-gray-800 p-5 transition-all hover:border-blue-500 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-gray-400">{typeLabels[project.type] || project.type}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs text-white ${status.color}`}>
          {status.label}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-gray-300">{project.description}</p>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span>챕터: {chapterCount}/{outlineChapters || '?'}</span>
        <span>수정: {formatDate(project.updatedAt)}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onSelect(project)}
          className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
        >
          편집
        </button>
        <a
          href={`/preview/${project.id}`}
          className="rounded bg-purple-600/20 px-3 py-2 text-sm text-purple-400 transition-colors hover:bg-purple-600/40 text-center"
        >
          프리뷰
        </a>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm('정말 이 프로젝트를 삭제하시겠습니까?')) {
              onDelete(project.id)
            }
          }}
          className="rounded bg-red-600/20 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-600/40"
        >
          삭제
        </button>
      </div>
    </div>
  )
}
