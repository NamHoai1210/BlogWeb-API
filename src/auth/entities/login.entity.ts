import { UserEntity } from 'src/users/entities/user.entity'

import { TokenEntity } from './token.entity'

export class LoginEntity extends TokenEntity {
  /**
   * User Profile
   */
  user?: UserEntity
  constructor(partial: Partial<TokenEntity>) {
    super(partial)
    Object.assign(this, partial)
  }
}
