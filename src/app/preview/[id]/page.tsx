'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookPreview } from '@/components/preview/BookPreview'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useBookStore } from '@/lib/store'
import type { BookProject } from '@/types/book'

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [project, setProject] = useState<BookProject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProject = useBookStore((state) => state.loadProject)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/projects/${id}`)
        const data = await res.json()

        if (!data.success) {
          setError(data.error || '프로젝트를 찾을 수 없습니다.')
          return
        }

        setProject(data.data)
      } catch {
        setError('프로젝트를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

  const handleDownloadPDF = async () => {
    if (!project) return

    const chaptersMap = new Map<number, string>()
    project.chapters.forEach((ch) => {
      chaptersMap.set(ch.number, ch.content)
    })

    const { downloadBookPDF } = await import('@/lib/pdf')
    await downloadBookPDF(project, chaptersMap)
  }

  const handleEdit = () => {
    if (project) {
      loadProject(project)
      router.push('/write')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" text="로딩 중..." />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-400 mb-8">{error || '프로젝트를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.push('/projects')}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            프로젝트 목록으로
          </button>
        </div>
      </div>
    )
  }

  return (
    <BookPreview
      project={project}
      onDownloadPDF={handleDownloadPDF}
      onEdit={handleEdit}
    />
  )
}
