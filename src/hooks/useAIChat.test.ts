import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAIChat } from './useAIChat'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useAIChat', () => {
  it('초기 상태를 반환한다', () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    })

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    expect(result.current.messages).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('chapterId가 null이면 메시지를 비운다', () => {
    global.fetch = vi.fn()

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: null })
    )

    expect(result.current.messages).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('chapterId가 있으면 히스토리를 로드한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: 'msg-1',
              role: 'user',
              content: '안녕',
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
        }),
    })

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1)
    })

    expect(result.current.messages[0].content).toBe('안녕')
  })

  it('sendMessage가 chapterId 없으면 아무것도 하지 않는다', async () => {
    global.fetch = vi.fn()

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: null })
    )

    await act(async () => {
      await result.current.sendMessage('hello', {
        chapterNumber: 1,
      })
    })

    expect(result.current.messages).toEqual([])
  })

  it('sendMessage가 빈 메시지를 무시한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    })

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await act(async () => {
      await result.current.sendMessage('   ', { chapterNumber: 1 })
    })

    expect(result.current.messages).toEqual([])
  })

  it('clearMessages가 메시지를 비운다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    })

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await act(async () => {
      await result.current.clearMessages()
    })

    expect(result.current.messages).toEqual([])
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('chapterId가 null이면 clearMessages가 fetch를 호출하지 않는다', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: null })
    )

    await act(async () => {
      await result.current.clearMessages()
    })

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('sendMessage가 스트리밍 응답을 처리한다', async () => {
    const encoder = new TextEncoder()
    const chunks = [
      encoder.encode('안녕하'),
      encoder.encode('세요'),
    ]

    let chunkIndex = 0
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (chunkIndex < chunks.length) {
          return Promise.resolve({ done: false, value: chunks[chunkIndex++] })
        }
        return Promise.resolve({ done: true, value: undefined })
      }),
    }

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      })
    global.fetch = mockFetch

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    // 히스토리 로드 완료 대기
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      await result.current.sendMessage('테스트', { chapterNumber: 1 })
    })

    expect(result.current.messages.length).toBeGreaterThanOrEqual(2)
    expect(result.current.messages[0].role).toBe('user')
    expect(result.current.messages[0].content).toBe('테스트')
    expect(result.current.isLoading).toBe(false)
  })

  it('sendMessage가 fetch 에러 시 에러 메시지를 추가한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
      .mockRejectedValueOnce(new Error('Network error'))
    global.fetch = mockFetch

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      await result.current.sendMessage('테스트', { chapterNumber: 1 })
    })

    const lastMsg = result.current.messages[result.current.messages.length - 1]
    expect(lastMsg.role).toBe('assistant')
    expect(lastMsg.content).toContain('Network error')
    expect(result.current.isLoading).toBe(false)
  })

  it('sendMessage가 response.body=null이면 에러 메시지를 추가한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        body: null,
      })
    global.fetch = mockFetch

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      await result.current.sendMessage('테스트', { chapterNumber: 1 })
    })

    const lastMsg = result.current.messages[result.current.messages.length - 1]
    expect(lastMsg.role).toBe('assistant')
    expect(lastMsg.content).toContain('No response body')
    expect(result.current.isLoading).toBe(false)
  })

  it('clearMessages가 DELETE 실패해도 메시지를 비운다', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 'msg-1', role: 'user', content: '안녕', createdAt: '2026-01-01T00:00:00Z' }] }),
      })
      .mockRejectedValueOnce(new Error('Delete failed'))

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1)
    })

    await act(async () => {
      await result.current.clearMessages()
    })

    expect(result.current.messages).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('채팅 히스토리 삭제 실패:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('togglePin이 메시지를 고정한다', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [{ id: 'msg-1', role: 'user', content: 'hello', createdAt: '2026-01-01T00:00:00Z', isPinned: false }],
        }),
      })
      .mockResolvedValueOnce({ ok: true }) // PATCH

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1)
    })

    await act(async () => {
      await result.current.togglePin('msg-1')
    })

    expect(result.current.messages[0].isPinned).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat'),
      expect.objectContaining({ method: 'PATCH' })
    )
  })

  it('togglePin이 고정된 메시지를 해제한다', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [{ id: 'msg-1', role: 'user', content: 'hello', createdAt: '2026-01-01T00:00:00Z', isPinned: true }],
        }),
      })
      .mockResolvedValueOnce({ ok: true }) // PATCH

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(result.current.messages[0].isPinned).toBe(true)
    })

    await act(async () => {
      await result.current.togglePin('msg-1')
    })

    expect(result.current.messages[0].isPinned).toBe(false)
  })

  it('togglePin API 실패 시 낙관적 업데이트를 롤백한다', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [{ id: 'msg-1', role: 'user', content: 'hello', createdAt: '2026-01-01T00:00:00Z', isPinned: false }],
        }),
      })
      .mockRejectedValueOnce(new Error('PATCH failed'))

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1)
    })

    await act(async () => {
      await result.current.togglePin('msg-1')
    })

    expect(result.current.messages[0].isPinned).toBe(false)
  })

  it('togglePin이 chapterId null이면 early return한다', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: null })
    )

    await act(async () => {
      await result.current.togglePin('msg-1')
    })

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('togglePin이 없는 messageId이면 early return한다', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    })

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      await result.current.togglePin('nonexistent')
    })

    // PATCH가 호출되지 않아야 함 (히스토리 로드 1회만)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('showPinnedOnly가 고정된 메시지만 필터링한다', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [
          { id: 'msg-1', role: 'user', content: 'pinned', createdAt: '2026-01-01T00:00:00Z', isPinned: true },
          { id: 'msg-2', role: 'user', content: 'not pinned', createdAt: '2026-01-01T00:01:00Z', isPinned: false },
        ],
      }),
    })

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2)
    })

    act(() => {
      result.current.setShowPinnedOnly(true)
    })

    expect(result.current.filteredMessages).toHaveLength(1)
    expect(result.current.filteredMessages[0].content).toBe('pinned')
  })

  it('searchQuery가 메시지를 필터링한다', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [
          { id: 'msg-1', role: 'user', content: '안녕하세요', createdAt: '2026-01-01T00:00:00Z' },
          { id: 'msg-2', role: 'assistant', content: '반갑습니다', createdAt: '2026-01-01T00:01:00Z' },
        ],
      }),
    })

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2)
    })

    act(() => {
      result.current.setSearchQuery('안녕')
    })

    expect(result.current.filteredMessages).toHaveLength(1)
    expect(result.current.filteredMessages[0].content).toBe('안녕하세요')
  })

  it('showPinnedOnly + searchQuery 조합 필터링이 동작한다', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [
          { id: 'msg-1', role: 'user', content: '검색어 포함', createdAt: '2026-01-01T00:00:00Z', isPinned: true },
          { id: 'msg-2', role: 'user', content: '검색어 포함', createdAt: '2026-01-01T00:01:00Z', isPinned: false },
          { id: 'msg-3', role: 'user', content: '다른 내용', createdAt: '2026-01-01T00:02:00Z', isPinned: true },
        ],
      }),
    })

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(3)
    })

    act(() => {
      result.current.setShowPinnedOnly(true)
      result.current.setSearchQuery('검색어')
    })

    expect(result.current.filteredMessages).toHaveLength(1)
    expect(result.current.filteredMessages[0].id).toBe('msg-1')
  })

  it('pinnedCount가 고정된 메시지 수를 반환한다', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [
          { id: 'msg-1', role: 'user', content: 'a', createdAt: '2026-01-01T00:00:00Z', isPinned: true },
          { id: 'msg-2', role: 'user', content: 'b', createdAt: '2026-01-01T00:01:00Z', isPinned: false },
          { id: 'msg-3', role: 'user', content: 'c', createdAt: '2026-01-01T00:02:00Z', isPinned: true },
        ],
      }),
    })

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(3)
    })

    expect(result.current.pinnedCount).toBe(2)
  })

  it('exportMessages가 메시지 복사본을 반환한다', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [
          { id: 'msg-1', role: 'user', content: 'test', createdAt: '2026-01-01T00:00:00Z' },
        ],
      }),
    })

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1)
    })

    const exported = result.current.exportMessages()
    expect(exported).toHaveLength(1)
    expect(exported[0].content).toBe('test')
    expect(exported).not.toBe(result.current.messages)
  })

  it('히스토리 로드 실패 시 에러를 console.error로 출력한다', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    global.fetch = vi.fn().mockRejectedValue(new Error('Load failed'))

    const { result } = renderHook(() =>
      useAIChat({ projectId: 'p1', chapterId: 'ch1' })
    )

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('채팅 히스토리 로드 실패:', expect.any(Error))
    })

    expect(result.current.messages).toEqual([])
    consoleSpy.mockRestore()
  })
})
