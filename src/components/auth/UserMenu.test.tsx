import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useSession, signOut } from 'next-auth/react'
import UserMenu from './UserMenu'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}))

const mockUseSession = useSession as Mock
const mockSignOut = signOut as Mock

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로딩 중일 때 스켈레톤을 표시한다', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' })
    const { container } = render(<UserMenu />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('비로그인 시 로그인 링크를 표시한다', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    render(<UserMenu />)
    const link = screen.getByText('로그인')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/auth/login')
  })

  it('비로그인 시 테마에 맞는 스타일을 사용한다', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    render(<UserMenu />)
    const link = screen.getByText('로그인')
    expect(link.className).toContain('text-brown')
    expect(link.className).toContain('dark:text-warm-gray')
    expect(link.className).not.toContain('bg-blue')
  })

  it('로그인 시 사용자 이니셜을 표시한다', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'John', email: 'john@test.com' } },
      status: 'authenticated',
    })
    render(<UserMenu />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('로그인 시 테마에 맞는 아바타 스타일을 사용한다', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'John', email: 'john@test.com' } },
      status: 'authenticated',
    })
    render(<UserMenu />)
    const button = screen.getByLabelText('사용자 메뉴')
    expect(button.className).toContain('bg-gold/20')
    expect(button.className).toContain('text-gold-dim')
    expect(button.className).not.toContain('bg-blue')
  })

  it('아바타 클릭 시 드롭다운 메뉴를 표시한다', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'John', email: 'john@test.com' } },
      status: 'authenticated',
    })
    render(<UserMenu />)

    fireEvent.click(screen.getByLabelText('사용자 메뉴'))

    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('john@test.com')).toBeInTheDocument()
    expect(screen.getByText('로그아웃')).toBeInTheDocument()
  })

  it('드롭다운이 테마에 맞는 스타일을 사용한다', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'John', email: 'john@test.com' } },
      status: 'authenticated',
    })
    render(<UserMenu />)

    fireEvent.click(screen.getByLabelText('사용자 메뉴'))

    const dropdown = screen.getByText('John').closest('div[class*="absolute"]')
    expect(dropdown?.className).toContain('bg-cream')
    expect(dropdown?.className).toContain('dark:bg-ink')
  })

  it('로그아웃 버튼 클릭 시 signOut을 호출한다', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'John', email: 'john@test.com' } },
      status: 'authenticated',
    })
    render(<UserMenu />)

    fireEvent.click(screen.getByLabelText('사용자 메뉴'))
    fireEvent.click(screen.getByText('로그아웃'))

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' })
  })
})
