import {ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateUserDto {
  @IsString()
  @ApiProperty()
  @IsOptional()
  name: string


  // @IsString()
  // @IsOptional()
  // @ApiProperty()
  // avatar: string
  
  // @IsString()
  // @IsOptional()
  // @ApiProperty()
  // password: string
}
