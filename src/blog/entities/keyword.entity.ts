import { ApiHideProperty } from '@nestjs/swagger'
import { Keyword } from '@prisma/client'
import { Exclude } from 'class-transformer'

export class KeywordEntity implements Keyword {
  id: number
  content: string
  @ApiHideProperty()
  @Exclude()
  createdAt: Date

  @ApiHideProperty()
  @Exclude()
  updatedAt: Date

  constructor(partial: Partial<KeywordEntity>) {
    Object.assign(this, partial);
  }
}
