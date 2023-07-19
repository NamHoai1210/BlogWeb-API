import { SystemRole } from 'src/common/constant/roles'

export class LoggedUserEntity {
  /**
   * user'id
   */
  id: number

  /**
   * user'id
   */
  role: SystemRole
}

export type LoggedUserRequest = {
  user: LoggedUserEntity
}
