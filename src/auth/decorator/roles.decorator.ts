import { SetMetadata } from '@nestjs/common'
import { SystemRole } from 'src/common/constant/roles'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: SystemRole[]) => SetMetadata(ROLES_KEY, roles)