import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Param,
  Patch,
  Query,
  Request,
  Logger,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { RoleAdmin, RoleUser } from 'src/common/constant/roles';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiInternalServerErrorResponse, ApiTags } from '@nestjs/swagger';
import { LoggedUserRequest } from 'src/auth/entities/logged-user.entity';
import { UserQueryDto } from './dto/admin/user-query.dto';
import { Prisma, Role } from '@prisma/client';
import { UserPaginateEntity } from './entities/admin/user-paginate.entity';
import { SwaggerResponse } from 'src/common/decorator/swagger-response.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
@ApiTags('User')
@Controller('users')
export class UsersController {
  private logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}
  @Get('me')
  async findMe(@Request() { user }: LoggedUserRequest): Promise<any> {
    const res = await this.usersService.findOne(+user.id);
    return res;
  }

  @Patch('me')
  async updateMe(
    @Request() { user }: LoggedUserRequest,
    @Body() data: UpdateUserDto,
  ) {
    try {
      const res = await this.usersService.update(+user.id, data);
      return res;
    } catch (error) {
      return new InternalServerErrorException()
    }
  }
  @Delete('avatar/me')
  async DeleteAvatar(
    @Request() {user}: LoggedUserRequest,
  ){
    try{
      const res = await this.usersService.deleteAvatar(+user.id)
      if(res) return {
        success: true
      }
      else return null;
    }catch(e){
      return null;
    }
  }
  @Roles(RoleAdmin)
  @Get()
  async findAll(@Query() queryDto: UserQueryDto): Promise<UserPaginateEntity> {
    const { page, pageSize, keyword, userType } = queryDto;

    const query: Prisma.UserWhereInput = {};
    if (userType) {
      query.role = userType;
    } else {
      query.role = Role.USER;
    }
    if (keyword) {
      query.OR = [
        {
          name: {
            contains: keyword,
          },
        },
        {
          email: {
            contains: keyword,
          },
        },
      ];
    }
    const { total, items } = await this.usersService.findAll(
      query,
      page,
      pageSize,
    );
    return {
      total,
      items: items.map((item) => new UserEntity(item)),
    };
  }
  @Roles(RoleAdmin)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    const res = await this.usersService.findOne(+id);
    return new UserEntity(res);
  }
  @Roles(RoleAdmin)
  @Patch(':id')
  async update(@Param('id') id: number, @Body() data: UpdateUserDto) {
    try {
      const res = await this.usersService.update(+id, data);
      return res;
    } catch (error) {}
  }
  @Roles(RoleAdmin)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    try {
      await this.usersService.delete(id);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  @Post('change-password')
  @SwaggerResponse(ApiInternalServerErrorResponse, {
    description: 'Change password exception',
  })
  async changePassword(
    @Request() { user }: LoggedUserRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const { oldPassword, newPassword } = changePasswordDto;
    this.logger.log(oldPassword, newPassword);
    const currentUser = await this.usersService.validateUser(
      user.id,
      oldPassword,
    );
    if (!currentUser) {
      throw new BadRequestException();
    }
    try {
      await this.usersService.changePassword(user.id, newPassword);
      return {
        success: true,
      };
    } catch (e) {
      return {
        success: false,
      };
    }
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './public/avatars'); // Specify the destination folder where files will be saved
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`); // Generate a random filename with the original file extension
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() { user }: LoggedUserRequest,
  ) {
    try {
      const res = await this.usersService.updateAvatar(+user.id, file.path.substring(file.path.indexOf('avatars')));

      const data = new UserEntity(res);
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
