import {
  clearSession,
  deleteCookie,
  getCookie,
  setCookie,
  useSession,
} from '@tanstack/react-start/server'
import { serverEnv } from '#/lib/env/server'
import type { AppRole } from '#/features/auth/auth-model'

export interface AppSessionData {
  userId?: string
  roles?: AppRole[]
}

interface OidcFlowSessionData {
  codeVerifier?: string
  state?: string
  returnTo?: string
}

const isSecureCookie = serverEnv.nodeEnv === 'production'

const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isSecureCookie,
  path: '/',
}

function getPassword() {
  return serverEnv.sessionSecret ?? 'phase-2-dev-session-secret-change-me'
}

export async function getAppSession() {
  return useSession<AppSessionData>({
    name: 'osrs-bingo-session',
    password: getPassword(),
    maxAge: serverEnv.sessionMaxAgeSeconds,
    cookie: baseCookieOptions,
  })
}

export async function saveAppSession(input: Required<AppSessionData>) {
  const session = await getAppSession()

  await session.update({
    userId: input.userId,
    roles: input.roles,
  })
}

export async function clearAppSession() {
  await clearSession({
    name: 'osrs-bingo-session',
    password: getPassword(),
    cookie: baseCookieOptions,
  })
}

export async function getOidcFlowSession() {
  return useSession<OidcFlowSessionData>({
    name: 'osrs-bingo-oidc',
    password: getPassword(),
    maxAge: 10 * 60,
    cookie: baseCookieOptions,
  })
}

export function savePostLogoutRedirectCookie(target: string) {
  setCookie('osrs-bingo-post-logout', target, {
    ...baseCookieOptions,
    maxAge: 10 * 60,
  })
}

export function readPostLogoutRedirectCookie() {
  return getCookie('osrs-bingo-post-logout')
}

export function clearPostLogoutRedirectCookie() {
  deleteCookie('osrs-bingo-post-logout', baseCookieOptions)
}
