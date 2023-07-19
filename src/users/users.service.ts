import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserGGDto } from './dto/create-user-gg.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hash, compare } from 'bcrypt';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';
import { UserEntity } from './entities/user.entity';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const res = await this.prismaService.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });
    if (!res) {
      const salt = bcrypt.genSaltSync(
        Number(this.configService.get('SALT_ROUND')),
      );
      const password = bcrypt.hashSync(createUserDto.password, salt);
      const user = await this.prismaService.user.create({
        data: { ...createUserDto, password: password, salt: salt },
      });
      return user;
    }
    return null;
  }

  async createGG(createUserGGDto: CreateUserGGDto){
    return await this.prismaService.user.create({
      data: {...createUserGGDto}
    })
  }

  async findAll(query: Prisma.UserWhereInput, page: number, pageSize: number) {
    const [total, items] = await this.prismaService.$transaction([
      this.prismaService.user.count({
        where: query,
      }),
      this.prismaService.user.findMany({
        where: query,
        select: {
          email: true,
          name: true,
          id: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
        take: pageSize,
        skip: pageSize * (page - 1),
      }),
    ]);
    return {
      total,
      items,
    };
  }
  findOne(id: number) {
    return this.prismaService.user.findFirst({
      where: {
        id: id,
      }
    });
  }
  findOneByEmail(email: string) {
    return this.prismaService.user.findFirst({
      where: {
        email: email,
      },
    });
  }
  findOneByName(name: string) {
    return this.prismaService.user.findMany({
      where: {
        name: {
          contains: name,
        },
      },
    });
  }
  delete(id: number) {
    return this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }

  async update(id: number, data: UpdateUserDto) {
    const result = await this.prismaService.user.update({
      where: { id },
      data: {
        ...data,
      },
    });
    return result;
    //}
  }
  async updateAvatar(id: number, path: string) {
    const user = await this.findOne(id);
    if (!user) return null;
    const oldPath = user.avatar;
    if (user.avatar) {
      await fs.unlink(join(__dirname, '../../../public/', oldPath), (err) => {
        if (err) {
          console.error(err);
          return null;
        }
      });
    }
    const result = await this.prismaService.user.update({
      where: { id },
      data: {
        avatar: path,
      },
    });
    return result;
    //}
  }

  async changePassword(id: number, password: string) {
    const u = await this.prismaService.user.findFirst({
      where: { id },
    });
    const newPassword = bcrypt.hashSync(password, u.salt);
    const result = await this.prismaService.user.update({
      where: { id },
      data: {
        password: newPassword,
      },
    });
    return result;
  }
  async validateUser(id: number, password: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) return null;
    const match = await compare(password, user.password);
    return match ? user : null;
  }

  async deleteAvatar(id: number) {
    const user = await this.findOne(id);
    if (!user) return null;
    const path = user.avatar;
    try {
      await fs.unlink(join(__dirname, '../../../public/', path), (err) => {
        if (err) {
          console.error(err);
          return null;
        }
      });
    } catch (e) {
      throw e;
    }
    const result = await this.prismaService.user.update({
      where: { id },
      data: {
        avatar: null,
      },
    });
    return result;
  }
}
