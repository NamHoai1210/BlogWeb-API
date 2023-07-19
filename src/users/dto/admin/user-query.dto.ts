import { ApiProperty } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginateDto } from 'src/common/dto/paginate.dto'


export class UserQueryDto extends PaginateDto {
    @ApiProperty({ enum: Role, example: Role.USER })
    @IsEnum(Role)
    @IsOptional()
    userType?: Role = Role.USER
  
    @IsOptional()
    @IsString()
    keyword?: string
}
