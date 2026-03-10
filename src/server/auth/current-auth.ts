import { createServerFn } from '@tanstack/react-start'
import { clearAppSession, getAppSession } from '#/lib/session/app-session'
import { findUserById } from '#/repositories/user-repository'

export const getCurrentAuth = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getAppSession()
    const userId = session.data.userId
    const roles = session.data.roles

    if (!userId || !roles || roles.length === 0) {
      return null
    }

    const user = await findUserById(userId)

    if (!user) {
      await clearAppSession()
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles,
    }
  },
)
