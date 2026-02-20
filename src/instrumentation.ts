export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export const onRequestError = async (
  err: { digest?: string } & Error,
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string }
) => {
  if (!process.env.SENTRY_DSN) return

  const { captureException, withScope } = await import('@sentry/nextjs')
  withScope((scope) => {
    scope.setTag('routerKind', context.routerKind)
    scope.setTag('routePath', context.routePath)
    scope.setTag('routeType', context.routeType)
    scope.setExtra('method', request.method)
    scope.setExtra('path', request.path)
    captureException(err)
  })
}
