import { PickType } from '@nestjs/swagger'

import { UserEntity } from './user.entity'

export class UserListEntity extends PickType(UserEntity, [
  'id',
  'name',
  'email',
  'avatar',
  'role',
] as const) {
  constructor(partial: Partial<UserListEntity>) {
    super(partial)
    Object.assign(this, partial)
  }
}
