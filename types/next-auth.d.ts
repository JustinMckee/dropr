import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'member' | 'maker' | 'admin'
      isArbitrator: boolean
      emailVerified: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    role: 'member' | 'maker' | 'admin'
    isArbitrator: boolean
    emailVerified: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'member' | 'maker' | 'admin'
    isArbitrator: boolean
    emailVerified: boolean
  }
}

// Override the emailVerified type to be boolean instead of Date
declare module '@auth/core/types' {
  interface User {
    emailVerified?: boolean
  }
}
