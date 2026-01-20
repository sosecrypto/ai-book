'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectCard } from '@/components/ProjectCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useBookStore } from '@/lib/store'
import type { BookProject, BookType } from '@/types/book'

const bookTypes: { value: BookType; label: string }[] = [
  { value: 'fiction', label: '소설' },
  { value: 'nonfiction', label: '논픽션' },
  { value: 'selfhelp', label: '자기계발' },
  { value: 'technical', label: '기술서' },
  { value: 'essay', label: '에세이' },
  { value: 'children', label: '아동도서' },
  { value: 'poetry', label: '시집' },
]

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<BookProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    type: 'fiction' as BookType,
    description: '',
  })

  const loadProject = useBookStore((state) => state.loadProject)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (data.success) {
        setProjects(data.data)
      } else {
        setError(data.error)
      }
    } catch {
      setError('프로젝트 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      })
      const data = await res.json()
      if (data.success) {
        setProjects([data.data, ...projects])
        setShowNewForm(false)
        setNewProject({ title: '', type: 'fiction', description: '' })
      } else {
        alert(data.error)
      }
    } catch {
      alert('프로젝트 생성에 실패했습니다.')
    }
  }

  const handleSelectProject = (project: BookProject) => {
    loadProject(project)
    router.push('/write')
  }

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setProjects(projects.filter((p) => p.id !== id))
      } else {
        alert(data.error)
      }
    } catch {
      alert('프로젝트 삭제에 실패했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">내 프로젝트</h1>
            <p className="mt-1 text-gray-400">저장된 책 프로젝트를 관리하세요</p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            + 새 프로젝트
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-900/50 p-4 text-red-200">
            {error}
          </div>
        )}

        {showNewForm && (
          <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">새 프로젝트 만들기</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-300">제목</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="책 제목을 입력하세요"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">유형</label>
                <select
                  value={newProject.type}
                  onChange={(e) => setNewProject({ ...newProject, type: e.target.value as BookType })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  {bookTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">설명</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="책에 대한 간단한 설명을 입력하세요"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  생성
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-500"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-600 p-12 text-center">
            <p className="text-gray-400">아직 프로젝트가 없습니다.</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              첫 번째 프로젝트를 만들어보세요
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={handleSelectProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
