'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function UserMenu() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (status === 'loading') {
    return (
      <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
    )
  }

  if (!session?.user) {
    return (
      <Link
        href="/auth/login"
        className="rounded-sm px-4 py-2 text-sm font-medium tracking-wide text-brown dark:text-warm-gray hover:text-deep-brown dark:hover:text-cream-light transition-colors"
      >
        로그인
      </Link>
    )
  }

  const initials = (session.user.name || session.user.email || '?')
    .charAt(0)
    .toUpperCase()

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-gold-dim text-sm font-medium hover:bg-gold/30 border border-gold/30 transition-colors"
        aria-label="사용자 메뉴"
      >
        {session.user.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={session.user.image}
            alt=""
            className="h-8 w-8 rounded-full"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-sm border border-stone/20 dark:border-cream/10 bg-cream dark:bg-ink shadow-lg z-50">
          <div className="px-4 py-3 border-b border-stone/10 dark:border-cream/10">
            <p className="text-sm font-medium text-ink dark:text-cream truncate">
              {session.user.name || '사용자'}
            </p>
            <p className="text-xs text-stone dark:text-warm-gray truncate">
              {session.user.email}
            </p>
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false)
                signOut({ callbackUrl: '/' })
              }}
              className="w-full text-left px-4 py-2 text-sm text-brown dark:text-warm-gray hover:bg-gold/10 hover:text-deep-brown dark:hover:text-cream transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
