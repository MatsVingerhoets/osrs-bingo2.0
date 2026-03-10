import { describe, expect, it } from 'vitest'
import {
  getLoginRedirectHref,
  isAdminRouteAuthorized,
} from '#/server/auth/route-guards'

describe('route guards', () => {
  it('builds login redirects that preserve the original destination', () => {
    expect(getLoginRedirectHref('/admin?tab=teams')).toBe(
      '/auth/login?returnTo=%2Fadmin%3Ftab%3Dteams',
    )
  })

  it('authorizes only admins for admin-only routes', () => {
    expect(isAdminRouteAuthorized(null)).toBe(false)
    expect(isAdminRouteAuthorized({ roles: ['USER'] })).toBe(false)
    expect(isAdminRouteAuthorized({ roles: ['ADMIN', 'USER'] })).toBe(true)
  })
})
