import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class UpdatePasswordDto {
  /**
   * Refresh Token
   * @example 'd50a44bc-5249-4406-83b1-afdea1887243'
   */
  @IsNotEmpty()
  @ApiProperty({
    description: 'email',
    example: 'abc@gmail.com',
  })

  
  email: string
  @IsNotEmpty()
  @ApiProperty({
    description: 'Token',
    example: 'd50a44bc-5249-4406-83b1-afdea1887243',
  })
  @IsNotEmpty()
  token: string


  @IsNotEmpty()
  @ApiProperty({
    description: 'password',
    example: '12345678',
  })
  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  @ApiProperty({
    description: 'password confirm',
    example: '12345678',
  })
  @IsNotEmpty()
  passwordConfirm: string
  
  
}
