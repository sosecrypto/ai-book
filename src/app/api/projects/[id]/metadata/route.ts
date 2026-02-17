import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/client'
import { BookMetadata, Author, BookCategory } from '@/types/book'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET: 메타데이터 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error: authError } = await requireAuth()
    if (authError) return authError

    const { id: projectId } = await params

    const metadata = await prisma.bookMetadata.findUnique({
      where: { projectId },
    })

    if (!metadata) {
      // 메타데이터가 없으면 빈 객체 반환
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    const parsed: BookMetadata = {
      id: metadata.id,
      projectId: metadata.projectId,
      subtitle: metadata.subtitle || undefined,
      authors: JSON.parse(metadata.authors) as Author[],
      publisher: metadata.publisher || undefined,
      publisherAddress: metadata.publisherAddress || undefined,
      publishDate: metadata.publishDate || undefined,
      edition: metadata.edition || undefined,
      printRun: metadata.printRun || undefined,
      categories: JSON.parse(metadata.categories) as BookCategory[],
      keywords: JSON.parse(metadata.keywords) as string[],
      language: metadata.language,
      copyright: metadata.copyright || undefined,
      license: metadata.license || undefined,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: parsed,
    })
  } catch (error) {
    console.error('Failed to get metadata:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get metadata' },
      { status: 500 }
    )
  }
}

// POST: 메타데이터 생성/수정 (upsert)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { error: authError } = await requireAuth()
    if (authError) return authError

    const { id: projectId } = await params
    const body = await request.json()

    const {
      subtitle,
      authors = [],
      publisher,
      publisherAddress,
      publishDate,
      edition,
      printRun,
      categories = [],
      keywords = [],
      language = 'ko',
      copyright,
      license,
    } = body

    const metadata = await prisma.bookMetadata.upsert({
      where: { projectId },
      update: {
        subtitle,
        authors: JSON.stringify(authors),
        publisher,
        publisherAddress,
        publishDate: publishDate ? new Date(publishDate) : null,
        edition,
        printRun,
        categories: JSON.stringify(categories),
        keywords: JSON.stringify(keywords),
        language,
        copyright,
        license,
      },
      create: {
        projectId,
        subtitle,
        authors: JSON.stringify(authors),
        publisher,
        publisherAddress,
        publishDate: publishDate ? new Date(publishDate) : null,
        edition,
        printRun,
        categories: JSON.stringify(categories),
        keywords: JSON.stringify(keywords),
        language,
        copyright,
        license,
      },
    })

    const parsed: BookMetadata = {
      id: metadata.id,
      projectId: metadata.projectId,
      subtitle: metadata.subtitle || undefined,
      authors: JSON.parse(metadata.authors) as Author[],
      publisher: metadata.publisher || undefined,
      publisherAddress: metadata.publisherAddress || undefined,
      publishDate: metadata.publishDate || undefined,
      edition: metadata.edition || undefined,
      printRun: metadata.printRun || undefined,
      categories: JSON.parse(metadata.categories) as BookCategory[],
      keywords: JSON.parse(metadata.keywords) as string[],
      language: metadata.language,
      copyright: metadata.copyright || undefined,
      license: metadata.license || undefined,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: parsed,
    })
  } catch (error) {
    console.error('Failed to save metadata:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save metadata' },
      { status: 500 }
    )
  }
}

// DELETE: 메타데이터 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { error: authError } = await requireAuth()
    if (authError) return authError

    const { id: projectId } = await params

    await prisma.bookMetadata.delete({
      where: { projectId },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Failed to delete metadata:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete metadata' },
      { status: 500 }
    )
  }
}
