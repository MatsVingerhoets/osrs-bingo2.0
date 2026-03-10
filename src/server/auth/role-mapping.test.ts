import { describe, expect, it } from 'vitest'
import { mapClientRolesToAppRoles } from '#/server/auth/role-mapping'

describe('mapClientRolesToAppRoles', () => {
  it('maps known Keycloak client roles to app roles', () => {
    expect(
      mapClientRolesToAppRoles(
        {
          resource_access: {
            'osrs-bingo-web': {
              roles: ['osrs_bingo_admin', 'osrs_bingo_user'],
            },
          },
        },
        'osrs-bingo-web',
      ),
    ).toEqual(['ADMIN', 'USER'])
  })

  it('deduplicates mapped roles', () => {
    expect(
      mapClientRolesToAppRoles(
        {
          resource_access: {
            app: {
              roles: ['osrs_bingo_user', 'osrs_bingo_user'],
            },
          },
        },
        'app',
      ),
    ).toEqual(['USER'])
  })

  it('falls back to USER when claims are missing or unsupported', () => {
    expect(mapClientRolesToAppRoles({}, 'app')).toEqual(['USER'])
    expect(
      mapClientRolesToAppRoles(
        {
          resource_access: {
            app: {
              roles: ['unrelated_role'],
            },
          },
        },
        'app',
      ),
    ).toEqual(['USER'])
  })
})
