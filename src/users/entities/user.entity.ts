import { ApiHideProperty } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity{
  id: number;
  email: string;
  name: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
  role: Role;

  @ApiHideProperty()
  @Exclude()
  password: string;
  @ApiHideProperty()
  @Exclude()
  salt: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
