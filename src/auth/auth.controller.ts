import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  Query,
  BadRequestException,
  Req,
  UseGuards,
  Redirect,
  Res,
} from '@nestjs/common'
import {
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { SwaggerResponse } from 'src/common/decorator/swagger-response.decorator'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { UserEntity } from 'src/users/entities/user.entity'
import { AuthService } from './auth.service'
import { Public } from './decorator/public-guard.decorator'
import { LoginDto } from './dto/login.dto'
import { RecoverPasswordDTO } from './dto/recover_password.dto'
import { RefreshTokenDto } from './dto/refresh_token.dto'
import { UpdatePasswordDto } from './dto/update_password.dto'
import { LoginEntity } from './entities/login.entity'
import { AuthGuard } from '@nestjs/passport';
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService

    ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = await this.authService.googleLogin(req)
    if (!user) throw new UnauthorizedException()
    const token = await this.authService.login(user)
    return res.redirect(process.env.CLIENT_URL+`/login-result?accessToken=${token.accessToken}&refreshToken=${token.refreshToken}`);
  }

  @Post('login')
  @SwaggerResponse(ApiInternalServerErrorResponse, {
    description: 'generate token exception',
  })
  @SwaggerResponse(ApiUnauthorizedResponse, {
    description: 'account is not valid',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginEntity> {
    const { email, password } = loginDto
    const user = await this.authService.validateUser(email, password)
    if (!user) {
      throw new UnauthorizedException()
    }
    const token = await this.authService.login(user)
    const ret: LoginEntity = {
      ...token,
    }
    ret.user = new UserEntity(user)
    return ret
  }

  @Post('/register')
  async register(@Body() dto: CreateUserDto) {
    const { email, password, name } = dto
    const user = await this.authService.validateUser(email, password)
    if (user) {
      throw new UnauthorizedException()
    } else {
      const newUser = await this.authService.register(email, password, name)
      if (!newUser) {
        throw new UnauthorizedException()
      }
    }

    return {
      success: true,
    }
  }

  @Post('refresh-token')
  @SwaggerResponse(ApiInternalServerErrorResponse, {
    description: 'generate token exception',
  })
  @SwaggerResponse(ApiUnauthorizedResponse, {
    description: 'token is not valid',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginEntity> {
    const user = await this.authService.validateRefreshToken(
      refreshTokenDto.token,
    )
    if (!user) {
      throw new UnauthorizedException()
    }
    const token = await this.authService.login(user, refreshTokenDto.token)
    const ret: LoginEntity = {
      ...token,
    }
    ret.user = new UserEntity(user)
    return ret
  }
  @Public()
  @Post('reset-password')
  @SwaggerResponse(ApiInternalServerErrorResponse, {
    description: 'generate token exception',
  })
  async recover(@Body() dto: RecoverPasswordDTO) {
    const { email } = dto
    const result = await this.authService.recoverEmail(email)
    if (!result) {
      throw new UnauthorizedException()
    }
    return {
      success: true,
    }
  }
  @Get('confirm')
  @SwaggerResponse(ApiInternalServerErrorResponse, {
    description: 'generate token exception',
  })
  async verifyMailToken(@Query() query: any) {
    const result = await this.authService.validateRecoverToken(query.token)
    if (!result) {
      throw new UnauthorizedException()
    }
    const r = new UserEntity(result)
    return r
  }

  @Post('update-password')
  @SwaggerResponse(ApiInternalServerErrorResponse, {
    description: 'update password',
  })
  async updatePassword(@Body() data: UpdatePasswordDto) {
    const result = await this.authService.validateRecoverToken(data.token)
    if (!result) {
      throw new UnauthorizedException()
    } else {
      if (data.password !== data.passwordConfirm) {
        throw new BadRequestException()
      }
      try {
        const user = await this.authService.updatePassword(
          data.password,
          result,
        )
        await this.authService.revokeTokenRecover(user.id)
        const r = new UserEntity(user)
        return r
      } catch (error) {
        throw new UnauthorizedException()
      }
    }
  }
}
