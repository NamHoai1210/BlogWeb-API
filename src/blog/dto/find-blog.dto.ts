import { ApiProperty } from '@nestjs/swagger'
import {  IsOptional, IsString } from 'class-validator'

export class FindBlogDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  keyword?: string

  @IsOptional()
  @IsString()
  page?: string = '1'

  @IsOptional()
  @IsString()
  pageSize?: string = '10'
}
