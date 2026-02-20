import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET() {
  const checks: Record<string, { status: string; message?: string }> = {
    database: { status: 'fail' },
    environment: { status: 'fail' },
  }

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = { status: 'pass' }
  } catch (error) {
    checks.database = {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Database connection failed',
    }
  }

  // Environment check
  const requiredVars = ['ANTHROPIC_API_KEY', 'AUTH_SECRET', 'DATABASE_URL']
  const missingVars = requiredVars.filter((v) => !process.env[v])
  if (missingVars.length === 0) {
    checks.environment = { status: 'pass' }
  } else {
    checks.environment = {
      status: 'fail',
      message: `Missing: ${missingVars.join(', ')}`,
    }
  }

  const isHealthy = Object.values(checks).every((c) => c.status === 'pass')

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: isHealthy ? 200 : 503 }
  )
}
