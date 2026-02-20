import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockQueryRaw } = vi.hoisted(() => ({
  mockQueryRaw: vi.fn(),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    $queryRaw: mockQueryRaw,
  },
}))

import { GET } from './route'

describe('GET /api/health', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      ANTHROPIC_API_KEY: 'test-key',
      AUTH_SECRET: 'test-secret',
      DATABASE_URL: 'postgresql://test',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns 200 when all checks pass', async () => {
    mockQueryRaw.mockResolvedValue([{ '?column?': 1 }])

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe('healthy')
    expect(body.checks.database.status).toBe('pass')
    expect(body.checks.environment.status).toBe('pass')
    expect(body.timestamp).toBeDefined()
  })

  it('returns 503 when database fails', async () => {
    mockQueryRaw.mockRejectedValue(new Error('Connection refused'))

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.status).toBe('unhealthy')
    expect(body.checks.database.status).toBe('fail')
    expect(body.checks.database.message).toBe('Connection refused')
  })

  it('returns 503 when environment variables are missing', async () => {
    mockQueryRaw.mockResolvedValue([{ '?column?': 1 }])
    delete (process.env as Record<string, string | undefined>).ANTHROPIC_API_KEY

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.status).toBe('unhealthy')
    expect(body.checks.environment.status).toBe('fail')
    expect(body.checks.environment.message).toContain('ANTHROPIC_API_KEY')
  })

  it('returns non-Error database failures gracefully', async () => {
    mockQueryRaw.mockRejectedValue('string error')

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.checks.database.message).toBe('Database connection failed')
  })
})
