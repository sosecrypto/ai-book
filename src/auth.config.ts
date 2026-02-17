import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicPath =
        nextUrl.pathname === '/' ||
        nextUrl.pathname.startsWith('/auth/') ||
        nextUrl.pathname.startsWith('/api/auth/')

      if (isPublicPath) return true
      if (isLoggedIn) return true

      return false // redirect to login
    },
  },
  providers: [], // configured in auth.ts
} satisfies NextAuthConfig
