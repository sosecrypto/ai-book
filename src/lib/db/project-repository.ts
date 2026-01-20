import { prisma } from './client'
import type { BookProject, BookOutline, Chapter, BookType, BookStatus } from '@/types/book'

export interface CreateProjectDto {
  title: string
  type: BookType
  description: string
}

export interface UpdateProjectDto {
  title?: string
  type?: BookType
  description?: string
  status?: BookStatus
  outline?: BookOutline | null
}

export interface CreateChapterDto {
  number: number
  title: string
  content: string
  status?: string
}

// Transform DB Project to BookProject
function toBookProject(dbProject: {
  id: string
  title: string
  type: string
  description: string
  status: string
  outline: string | null
  createdAt: Date
  updatedAt: Date
  chapters: {
    id: string
    number: number
    title: string
    content: string
    status: string
  }[]
}): BookProject {
  return {
    id: dbProject.id,
    title: dbProject.title,
    type: dbProject.type as BookType,
    description: dbProject.description,
    status: dbProject.status as BookStatus,
    outline: dbProject.outline ? JSON.parse(dbProject.outline) : null,
    chapters: dbProject.chapters.map((ch) => ({
      number: ch.number,
      title: ch.title,
      content: ch.content,
      status: ch.status as Chapter['status'],
      revisions: [],
    })),
    createdAt: dbProject.createdAt,
    updatedAt: dbProject.updatedAt,
  }
}

export const projectRepository = {
  async findAll(): Promise<BookProject[]> {
    const projects = await prisma.project.findMany({
      include: { chapters: true },
      orderBy: { updatedAt: 'desc' },
    })
    return projects.map(toBookProject)
  },

  async findById(id: string): Promise<BookProject | null> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { chapters: { orderBy: { number: 'asc' } } },
    })
    return project ? toBookProject(project) : null
  },

  async create(data: CreateProjectDto): Promise<BookProject> {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        type: data.type,
        description: data.description,
        status: 'draft',
      },
      include: { chapters: true },
    })
    return toBookProject(project)
  },

  async update(id: string, data: UpdateProjectDto): Promise<BookProject> {
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.type && { type: data.type }),
        ...(data.description && { description: data.description }),
        ...(data.status && { status: data.status }),
        ...(data.outline !== undefined && {
          outline: data.outline ? JSON.stringify(data.outline) : null,
        }),
      },
      include: { chapters: { orderBy: { number: 'asc' } } },
    })
    return toBookProject(project)
  },

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } })
  },

  async saveChapter(projectId: string, data: CreateChapterDto): Promise<void> {
    await prisma.chapter.upsert({
      where: {
        projectId_number: {
          projectId,
          number: data.number,
        },
      },
      update: {
        title: data.title,
        content: data.content,
        status: data.status ?? 'writing',
      },
      create: {
        projectId,
        number: data.number,
        title: data.title,
        content: data.content,
        status: data.status ?? 'writing',
      },
    })
  },

  async deleteChapter(projectId: string, chapterNumber: number): Promise<void> {
    await prisma.chapter.delete({
      where: {
        projectId_number: {
          projectId,
          number: chapterNumber,
        },
      },
    })
  },
}
