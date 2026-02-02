import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { projectRepository } from '@/lib/db/project-repository'

// TODO: 인증 미들웨어 추가 필요 (Task #2)

interface RouteParams {
  params: Promise<{ id: string }>
}

const SaveChapterSchema = z.object({
  number: z.number().int().positive().max(1000),
  title: z.string().min(1).max(200),
  content: z.string().max(500000),
  status: z.enum(['writing', 'draft', 'complete']).optional(),
})

// POST /api/projects/[id]/chapters - 챕터 저장
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const parseResult = SaveChapterSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: '잘못된 요청입니다.', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { number, title, content, status } = parseResult.data

    const project = await projectRepository.findById(id)
    if (!project) {
      return NextResponse.json(
        { success: false, error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const chapter = await projectRepository.saveChapter(id, { number, title, content, status })
    return NextResponse.json({ success: true, message: '챕터가 저장되었습니다.', data: chapter })
  } catch {
    return NextResponse.json(
      { success: false, error: '챕터 저장에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]/chapters - 챕터 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const chapterNumberParam = searchParams.get('number')

    if (!chapterNumberParam) {
      return NextResponse.json(
        { success: false, error: '챕터 번호가 필요합니다.' },
        { status: 400 }
      )
    }

    const chapterNumber = parseInt(chapterNumberParam, 10)
    if (isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > 1000) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 챕터 번호입니다.' },
        { status: 400 }
      )
    }

    await projectRepository.deleteChapter(id, chapterNumber)
    return NextResponse.json({ success: true, message: '챕터가 삭제되었습니다.' })
  } catch {
    return NextResponse.json(
      { success: false, error: '챕터 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
