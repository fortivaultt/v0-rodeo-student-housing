import * as Sentry from '@sentry/node'

export function init() {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return Sentry

  if (!Sentry.getCurrentHub().getClient()) {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
    })
  }

  return Sentry
}
