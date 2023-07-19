import { SystemRole } from 'src/common/constant/roles'

export class JwtPayloadEntity {
  /**
   * user'id
   */
  sub: number

  /**
   * user'id
   */
  role: SystemRole
}
