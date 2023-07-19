import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Public } from 'src/auth/decorator/public-guard.decorator';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RoleAdmin } from 'src/common/constant/roles';
import { FindCommentDto } from './dto/find-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import {
  LoggedUserEntity,
  LoggedUserRequest,
} from 'src/auth/entities/logged-user.entity';
import { PrismaService } from 'src/db/prisma.service';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  private logger = new Logger(CommentController.name);
  constructor(
    private readonly commentService: CommentService,
    private readonly prismaService: PrismaService
  ) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    const { content, blogId } = createCommentDto;
    const id = req.user.id;
    return this.commentService.create(content, blogId, id);
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    const comment = await this.commentService.findOne(+id);
    if (comment.userId !== req.user.id)
      return {
        success: false,
      };
    try {
      await this.commentService.update(+id, updateCommentDto);
      return {
        success: true,
      };
    } catch (e) {
      return {
        success: false,
      };
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Request() { user }: LoggedUserRequest,
  ) {
    const comment = await this.commentService.findOne(+id);
    if (!comment) throw new BadRequestException();
    const blog = await this.prismaService.blog.findFirst({where: {id: comment.blogId, userId: user.id}});
    if(!blog) throw new BadRequestException()
    try {
      await this.commentService.remove(+id);
      return {
        success: true,
      };
    } catch (e) {
      throw new InternalServerErrorException()
    }
  }

  @Post(':id/like')
  async like(
    @Request() { user }: { user: LoggedUserEntity },
    @Param() params,
    @Body() body,
  ) {
    const { id } = params;
    const { isLiked } = body;
    try {
      const comment = await this.commentService.findOne(+id);
      if (!comment) {
        throw new BadRequestException();
      }
      const success = await this.commentService.setLike(+id, user.id, isLiked);
      this.logger.log(success)
      if (success) {
        const cmt = await this.commentService.updateLikeCount(+id, isLiked);
        return {
          success: true,
          likeCount: cmt.likeCount
        };
      } else {
        return {
          success: false,
        };
      }
    } catch (e) {
      this.logger.log(e)
      return {
        success: false,
      };
    }
  }
}
