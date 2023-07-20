import { ApiProperty } from '@nestjs/swagger'
import {  IsNumber, IsOptional, IsString } from 'class-validator'

export class FindKeywordDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  key?: string

  @IsOptional()
  @IsString()
  page?: string = '1'

  @IsOptional()
  @IsString()
  pageSize?: string = '30'
}
