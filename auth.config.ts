import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-email',
    newUser: '/auth/register'
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl
      const userRole = auth?.user?.role
      const isArbitrator = auth?.user?.isArbitrator
      
      // Public routes that don't require authentication
      const publicRoutes = [
        '/',
        '/auth/login',
        '/auth/register',
        '/auth/verify-email',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/api/auth',
        '/drops'
      ]
      
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
      
      // Allow public routes
      if (isPublicRoute) {
        return true
      }
      
      // Redirect to login if not authenticated
      if (!isLoggedIn) {
        return Response.redirect(new URL('/auth/login', nextUrl))
      }
      
      // Role-based access control for protected routes
      
      // Admin-only routes
      if (pathname.startsWith('/admin')) {
        if (userRole !== 'admin') {
          return Response.redirect(new URL('/', nextUrl))
        }
      }
      
      // Arbitrator routes (admin with isArbitrator flag)
      if (pathname.startsWith('/arbitrator') || pathname.startsWith('/disputes')) {
        if (userRole !== 'admin' || !isArbitrator) {
          return Response.redirect(new URL('/', nextUrl))
        }
      }
      
      // Maker-specific routes (maker or admin)
      const makerRoutes = [
        '/profile/maker-setup',
        '/maker/dashboard',
        '/maker/products',
        '/maker/drops',
        '/maker/orders',
        '/maker/analytics'
      ]
      
      const isMakerRoute = makerRoutes.some(route => pathname.startsWith(route))
      
      if (isMakerRoute) {
        if (userRole !== 'maker' && userRole !== 'admin') {
          return Response.redirect(new URL('/profile', nextUrl))
        }
      }
      
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.image = user.image
        token.role = user.role
        token.isArbitrator = user.isArbitrator
        token.emailVerified = user.emailVerified
      }
      
      // Handle session updates
      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.image = token.image as string | null
        session.user.role = token.role as 'member' | 'maker' | 'admin'
        session.user.isArbitrator = token.isArbitrator as boolean
        // @ts-ignore - NextAuth type mismatch with custom boolean emailVerified
        session.user.emailVerified = Boolean(token.emailVerified)
      }
      return session
    }
  },
  providers: [], // Providers will be added in auth.ts
} satisfies NextAuthConfig
