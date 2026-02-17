import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password utilities', () => {
  describe('hashPassword', () => {
    it('should return a bcrypt hash string', async () => {
      const hash = await hashPassword('testPassword123')
      expect(hash).toBeDefined()
      expect(hash).not.toBe('testPassword123')
      expect(hash).toMatch(/^\$2[aby]?\$/)
    })

    it('should produce different hashes for the same password', async () => {
      const hash1 = await hashPassword('samePassword')
      const hash2 = await hashPassword('samePassword')
      expect(hash1).not.toBe(hash2)
    })

    it('should handle empty string', async () => {
      const hash = await hashPassword('')
      expect(hash).toBeDefined()
      expect(hash).toMatch(/^\$2[aby]?\$/)
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const hash = await hashPassword('correctPassword')
      const result = await verifyPassword('correctPassword', hash)
      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const hash = await hashPassword('correctPassword')
      const result = await verifyPassword('wrongPassword', hash)
      expect(result).toBe(false)
    })
  })
})
