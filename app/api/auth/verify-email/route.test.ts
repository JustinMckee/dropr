import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from './route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    verificationToken: {
      findUnique: vi.fn(),
      delete: vi.fn()
    },
    user: {
      update: vi.fn()
    }
  }
}))

describe('Email Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      const mockToken = {
        identifier: 'test@example.com',
        token: 'valid-token',
        expires: new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now
      }

      vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue(mockToken as any)
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true
      } as any)

      const request = new Request('http://localhost:3000/api/auth/verify-email?token=valid-token')

      const response = await GET(request as any)

      expect(response.status).toBe(307) // Redirect status
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: { emailVerified: true }
      })
      expect(prisma.verificationToken.delete).toHaveBeenCalled()
    })

    it('should reject invalid token', async () => {
      vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/auth/verify-email?token=invalid-token')

      const response = await GET(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid verification token')
    })

    it('should reject expired token', async () => {
      const mockToken = {
        identifier: 'test@example.com',
        token: 'expired-token',
        expires: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      }

      vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue(mockToken as any)

      const request = new Request('http://localhost:3000/api/auth/verify-email?token=expired-token')

      const response = await GET(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('expired')
      expect(prisma.verificationToken.delete).toHaveBeenCalled()
    })

    it('should require token parameter', async () => {
      const request = new Request('http://localhost:3000/api/auth/verify-email')

      const response = await GET(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('required')
    })
  })

  describe('POST /api/auth/verify-email', () => {
    it('should verify email via POST with valid token', async () => {
      const mockToken = {
        identifier: 'test@example.com',
        token: 'valid-token',
        expires: new Date(Date.now() + 1000 * 60 * 60)
      }

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true
      }

      vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue(mockToken as any)
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any)

      const request = new Request('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token: 'valid-token' })
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toContain('verified successfully')
      expect(data.user.emailVerified).toBe(true)
    })

    it('should reject POST without token', async () => {
      const request = new Request('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('required')
    })
  })
})
