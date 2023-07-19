import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { SystemRole } from 'src/common/constant/roles'

import { ROLES_KEY } from '../decorator/roles.decorator'
import { LoggedUserRequest } from '../entities/logged-user.entity'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )
    if (!requiredRoles) {
      return true
    }
    const { user } = context.switchToHttp().getRequest<LoggedUserRequest>()
    return requiredRoles.some((role) => user.role === role)
  }
}
