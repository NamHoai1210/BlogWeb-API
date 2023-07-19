import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class RecoverPasswordDTO {
  /**
   * Refresh Token
   * @example 'd50a44bc-5249-4406-83b1-afdea1887243'
   */
  @IsNotEmpty()
  @ApiProperty({
    description: 'email',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  email: string
}
