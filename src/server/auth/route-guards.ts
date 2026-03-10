type AuthLike = {
  roles: string[]
}

export function getLoginRedirectHref(returnTo: string) {
  return `/auth/login?returnTo=${encodeURIComponent(returnTo)}`
}

export function isAdminRouteAuthorized(auth: AuthLike | null) {
  return Boolean(auth?.roles.includes('ADMIN'))
}
