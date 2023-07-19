import { ApiHideProperty } from '@nestjs/swagger'
import { Blog, Keyword } from '@prisma/client'
import { Exclude } from 'class-transformer'
import { CommentEntity } from 'src/comment/entities/comment.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { KeywordEntity } from './keyword.entity'

export class BlogEntity implements Blog {
  id: number
  title: string

  content: string

  keywords: KeywordEntity[]

  likeCount: number

  disLikeCount: number

  @ApiHideProperty()
  @Exclude()
  createdAt: Date

  @ApiHideProperty()
  @Exclude()
  updatedAt: Date

  status: boolean

  viewCount: number

  userId: number

  User?: UserEntity

  Comments?: CommentEntity[]

  constructor(partial: Partial<BlogEntity>) {
    Object.assign(this, partial);
  }
}
