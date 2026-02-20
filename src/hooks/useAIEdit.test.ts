import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAIEdit } from './useAIEdit'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useAIEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('초기 상태가 올바르다', () => {
    const { result } = renderHook(() => useAIEdit({
      projectId: 'project-1',
      chapterId: 'chapter-1',
    }))

    expect(result.current.selectedText).toBe('')
    expect(result.current.selectionRange).toBeNull()
    expect(result.current.isEditing).toBe(false)
    expect(result.current.editInstruction).toBe('')
  })

  it('handleSelectionChange가 선택 텍스트를 업데이트한다', () => {
    const { result } = renderHook(() => useAIEdit({
      projectId: 'project-1',
      chapterId: 'chapter-1',
    }))

    act(() => {
      result.current.handleSelectionChange('선택된 텍스트', { from: 0, to: 10 })
    })

    expect(result.current.selectedText).toBe('선택된 텍스트')
    expect(result.current.selectionRange).toEqual({ from: 0, to: 10 })
  })

  it('resetSelection이 선택을 초기화한다', () => {
    const { result } = renderHook(() => useAIEdit({
      projectId: 'project-1',
      chapterId: 'chapter-1',
    }))

    act(() => {
      result.current.handleSelectionChange('선택된 텍스트', { from: 0, to: 10 })
    })

    act(() => {
      result.current.resetSelection()
    })

    expect(result.current.selectedText).toBe('')
    expect(result.current.selectionRange).toBeNull()
  })

  it('setEditInstruction이 수정 지시를 업데이트한다', () => {
    const { result } = renderHook(() => useAIEdit({
      projectId: 'project-1',
      chapterId: 'chapter-1',
    }))

    act(() => {
      result.current.setEditInstruction('더 간결하게')
    })

    expect(result.current.editInstruction).toBe('더 간결하게')
  })

  it('handleAIEdit이 API를 호출한다', async () => {
    // Mock ReadableStream
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('수정된 ') })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('텍스트') })
        .mockResolvedValueOnce({ done: true, value: undefined })
    }

    mockFetch.mockResolvedValue({
      ok: true,
      body: {
        getReader: () => mockReader
      }
    })

    const { result } = renderHook(() => useAIEdit({
      projectId: 'project-1',
      chapterId: 'chapter-1',
    }))

    act(() => {
      result.current.handleSelectionChange('원본 텍스트', { from: 0, to: 10 })
      result.current.setEditInstruction('더 간결하게')
    })

    let editResult: string | null = null
    await act(async () => {
      editResult = await result.current.handleAIEdit('주변 컨텍스트')
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects/project-1/chapters/chapter-1/edit',
      expect.objectContaining({ method: 'POST' })
    )
    expect(editResult).toBe('수정된 텍스트')
  })

  it('chapterId가 없으면 handleAIEdit이 null을 반환한다', async () => {
    const { result } = renderHook(() => useAIEdit({
      projectId: 'project-1',
      chapterId: null,
    }))

    act(() => {
      result.current.handleSelectionChange('원본 텍스트', { from: 0, to: 10 })
      result.current.setEditInstruction('더 간결하게')
    })

    let editResult: string | null = null
    await act(async () => {
      editResult = await result.current.handleAIEdit('컨텍스트')
    })

    expect(editResult).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('API 에러 시 editError 상태를 설정한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal Server Error' }),
    })

    const { result } = renderHook(() => useAIEdit({
      projectId: 'project-1',
      chapterId: 'chapter-1',
    }))

    act(() => {
      result.current.handleSelectionChange('원본 텍스트', { from: 0, to: 10 })
      result.current.setEditInstruction('더 간결하게')
    })

    let editResult: string | null = null
    await act(async () => {
      editResult = await result.current.handleAIEdit('컨텍스트')
    })

    expect(editResult).toBeNull()
    expect(result.current.editError).toBe('Internal Server Error')
    expect(result.current.isEditing).toBe(false)
  })

  it('response.body가 null이면 에러를 설정한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    mockFetch.mockResolvedValue({
      ok: true,
      body: null,
    })

    const { result } = renderHook(() => useAIEdit({
      projectId: 'project-1',
      chapterId: 'chapter-1',
    }))

    act(() => {
      result.current.handleSelectionChange('원본 텍스트', { from: 0, to: 10 })
      result.current.setEditInstruction('더 간결하게')
    })

    let editResult: string | null = null
    await act(async () => {
      editResult = await result.current.handleAIEdit('컨텍스트')
    })

    expect(editResult).toBeNull()
    expect(result.current.editError).toBe('No response body')
  })

  it('response.ok=false 시 data.error를 파싱한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: '잘못된 요청입니다.' }),
    })

    const { result } = renderHook(() => useAIEdit({
      projectId: 'project-1',
      chapterId: 'chapter-1',
    }))

    act(() => {
      result.current.handleSelectionChange('텍스트', { from: 0, to: 5 })
      result.current.setEditInstruction('수정')
    })

    await act(async () => {
      await result.current.handleAIEdit('ctx')
    })

    expect(result.current.editError).toBe('잘못된 요청입니다.')
  })

  it('429 에러 시 quota 메시지를 표시한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.reject(new Error('no json')),
    })

    const { result } = renderHook(() => useAIEdit({
      projectId: 'project-1',
      chapterId: 'chapter-1',
    }))

    act(() => {
      result.current.handleSelectionChange('텍스트', { from: 0, to: 5 })
      result.current.setEditInstruction('수정')
    })

    await act(async () => {
      await result.current.handleAIEdit('ctx')
    })

    expect(result.current.editError).toBe('이번 달 AI 사용량 한도에 도달했습니다.')
  })

  it('finally에서 isEditing=false를 보장한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAIEdit({
      projectId: 'project-1',
      chapterId: 'chapter-1',
    }))

    act(() => {
      result.current.handleSelectionChange('텍스트', { from: 0, to: 5 })
      result.current.setEditInstruction('수정')
    })

    await act(async () => {
      await result.current.handleAIEdit('ctx')
    })

    expect(result.current.isEditing).toBe(false)
  })

  it('selectedText가 없으면 handleAIEdit이 null을 반환한다', async () => {
    const { result } = renderHook(() => useAIEdit({
      projectId: 'project-1',
      chapterId: 'chapter-1',
    }))

    act(() => {
      result.current.setEditInstruction('더 간결하게')
    })

    let editResult: string | null = null
    await act(async () => {
      editResult = await result.current.handleAIEdit('컨텍스트')
    })

    expect(editResult).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
