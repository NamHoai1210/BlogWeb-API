import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'User'
  })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user@example.com'
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'password'
  })
  password: string;

  @IsOptional()
  salt?: string;
}
