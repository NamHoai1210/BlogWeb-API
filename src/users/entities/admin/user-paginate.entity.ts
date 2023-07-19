import { PaginateEntity } from 'src/common/entities/paginate.entity'

import { UserEntity } from '../user.entity'

export class UserPaginateEntity implements PaginateEntity<UserEntity> {
  total: number

  items: UserEntity[]
}