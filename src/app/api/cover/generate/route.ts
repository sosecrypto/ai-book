import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/db/client'
import { generateCoverPrompt } from '@/lib/cover-generator'
import { getRecommendedTemplate } from '@/lib/cover-templates'
import type { BookType } from '@/types/book'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, title, type, description, customPrompt } = body as {
      projectId: string
      title: string
      type: BookType
      description?: string
      customPrompt?: string
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey })

    // Generate prompt
    const template = getRecommendedTemplate(type)
    const project = { id: projectId, title, type, description } as { id: string; title: string; type: BookType; description: string }
    const basePrompt = generateCoverPrompt(project as never, template)
    const finalPrompt = customPrompt ? `${basePrompt}\n\nAdditional requirements: ${customPrompt}` : basePrompt

    // Generate image with DALL-E
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: finalPrompt,
      n: 1,
      size: '1024x1792', // Portrait orientation for book cover
      quality: 'standard',
    })

    const imageData = response.data
    if (!imageData || imageData.length === 0 || !imageData[0].url) {
      throw new Error('이미지 생성에 실패했습니다.')
    }
    const imageUrl = imageData[0].url

    // Save to database if projectId is provided
    if (projectId) {
      await prisma.coverImage.upsert({
        where: { projectId },
        update: {
          imageUrl,
          prompt: finalPrompt,
        },
        create: {
          projectId,
          imageUrl,
          prompt: finalPrompt,
        },
      })
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: finalPrompt,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
