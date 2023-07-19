import { ApiProperty } from '@nestjs/swagger';

import {  IsOptional, IsString } from 'class-validator';

export class FindUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string
}
