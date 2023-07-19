import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class RefreshTokenDto {
  /**
   * Refresh Token
   * @example 'd50a44bc-5249-4406-83b1-afdea1887243'
   */
  @IsNotEmpty()
  @ApiProperty({
    description: 'Refresh Token',
    example: 'd50a44bc-5249-4406-83b1-afdea1887243',
  })
  @IsNotEmpty()
  token: string
  
}
