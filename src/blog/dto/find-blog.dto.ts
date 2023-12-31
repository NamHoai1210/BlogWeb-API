import { ApiProperty } from '@nestjs/swagger'
import {  IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

export class FindBlogDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty()
  keyword?: number

  @IsOptional()
  @IsString()
  page?: string = '1'

  @IsOptional()
  @IsString()
  pageSize?: string = '20'
}
