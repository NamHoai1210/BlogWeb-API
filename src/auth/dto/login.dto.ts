import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class LoginDto {
  /**
   * User's email
   * @example 'user@example.com'
   */
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsEmail()
  @Transform(({ value }) => ('' + value).toLowerCase())
  email: string
  /**
   * User's password
   * @example 'password'
   */
  @ApiProperty({
    example: 'password',
  })
  @IsNotEmpty()
  password: string
  
}
