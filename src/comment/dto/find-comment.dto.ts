import { ApiProperty } from '@nestjs/swagger'
import {  IsOptional, IsString } from 'class-validator'
import { PaginateDto } from 'src/common/dto/paginate.dto'
export class FindCommentDto extends PaginateDto {
  @IsOptional()
  @ApiProperty()
  content?: string
}
