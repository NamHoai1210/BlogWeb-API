import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { compare } from 'bcrypt'
import { nanoid } from 'nanoid/async'

import { TokenEntity } from './entities/token.entity'
import { PrismaService } from 'src/db/prisma.service'
import { memoizedMs } from 'src/common/helper/memoize'
import { ConfigService } from '@nestjs/config'
import { JwtPayloadEntity } from './entities/jwt-payload.entity'
import { RoleAdmin } from 'src/common/constant/roles'
// import { MailService } from 'src/mail/mail.service'
import bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) // private mailService: MailService,
  {}

  async googleLogin(req) {
    if (!req.user) {
      return null;
    }
    const {email, firstName, lastName, picture} = req.user;
    const user = await this.usersService.findOneByEmail(email)
    if(!user) {
      return this.usersService.createGG({
        email,
        name: firstName + ' ' + lastName,
        avatar: picture,
      })
    }
    return user;
  }

  async register(email: string, password: string, name: string) {
    const user = await this.usersService.create({ email, password, name })
    return user
  }
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByEmail(email)
    if (user && user.password) {
      const match = await compare(password, user.password)
      return match ? user : null
    }
    return null
  }
  async login(user: User, token?: string): Promise<TokenEntity> {
    const isAdmin = !('role' in user)

    const refreshToken = await nanoid()
    await this.prismaService.token.create({
      data: {
        token: refreshToken,
        userId: user.id,
        isAdmin,
        expiredAt: new Date(
          Date.now() +
            memoizedMs(
              this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
            ),
        ),
      },
    })
    const payload: JwtPayloadEntity = {
      role: isAdmin ? RoleAdmin : user.role,
      sub: user.id,
    }
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: refreshToken,
    }
  }

  async validateRefreshToken(token: string): Promise<User | undefined> {
    const refreshToken = await this.prismaService.token.findUnique({
      where: {
        token,
      },
    })

    if (!refreshToken) {
      return undefined
    }

    const now = Date.now()
    const expiredAt = new Date(refreshToken.expiredAt).getTime()
    if (now > expiredAt) {
      await this.prismaService.token.delete({
        where: {
          id: refreshToken.id,
        },
      })
      return undefined
    }
    return this.usersService.findOne(refreshToken.userId)
  }
  async revokeToken(userId: number, isAdmin = false) {
    await this.prismaService.token.deleteMany({
      where: {
        userId,
        isAdmin,
      },
    })
  }
  async recoverEmail(email: string): Promise<User> {
    const user = await this.usersService.findOneByEmail(email)
    if (user) {
      const token = await nanoid()
      await this.prismaService.recoverToken.create({
        data: {
          token: token,
          userId: user.id,
          expiredAt: new Date(
            Date.now() +
              memoizedMs(
                this.configService.get<string>('REGISTER_TOKEN_EXPIRES_IN'),
              ),
          ),
        },
      })
      // await this.mailService.sendUserConfirmation(user, token)
      return user
    }
    return null
  }
  async validateRecoverToken(token: string): Promise<User | undefined> {
    const recoverToken = await this.prismaService.recoverToken.findUnique({
      where: {
        token,
      },
    })

    if (!recoverToken) {
      return undefined
    }

    const now = Date.now()
    const expiredAt = new Date(recoverToken.expiredAt).getTime()
    if (now > expiredAt) {
      await this.prismaService.recoverToken.delete({
        where: {
          id: recoverToken.id,
        },
      })
      return undefined
    }
    return this.usersService.findOne(recoverToken.userId)
  }
  async revokeTokenRecover(userId: number) {
    await this.prismaService.recoverToken.deleteMany({
      where: {
        userId,
      },
    })
  }

  async updatePassword(password: string, user: User) {
    password = bcrypt.hashSync(password, user.salt)
    const result = this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: password,
      },
    })
    return result
  }
}
