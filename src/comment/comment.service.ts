import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}
  private logger = new Logger(CommentService.name);
  create(content: string, blogId: number, userId: number) {
    return this.prismaService.comment.create({
        data: {
          content,
          blogId,
          userId,
        },
      });
    }

  async findAll(content: string, page: number, pageSize: number) {
    this.logger.log(content);
    const [total, items] = await this.prismaService.$transaction([
      this.prismaService.comment.count({
        where: {
          content: {
            contains: content,
          },
        },
      }),
      this.prismaService.comment.findMany({
        where: {
          content: {
            contains: content,
          },
        },
        include: {
          User: {
            select: {
              name: true,
            },
          },
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

  async findAllByBlog(blogId:number){
    return this.prismaService.comment.findMany({
      where: {
        blogId,
      }
    })
  } 

  findOne(id: number) {
    return this.prismaService.comment.findUnique({
      where: {
        id,
      },
      include: {
        User: true,
      },
    });
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return this.prismaService.comment.update({
      where: {
        id,
      },
      data: {
        content: updateCommentDto.content,
      },
    });
  }

  remove(id: number) {
    return this.prismaService.comment.delete({
      where: {
        id,
      },
    });
  }

  updateLikeCount(id: number, isLiked: boolean) {
    const like = isLiked ? 1 : -1;
    return this.prismaService.comment.update({
      where: {
        id,
      },
      data: {
        likeCount: {
          increment: like,
        },
      },
    });
  }

  async setLike(id: number, userId: number, isLiked: boolean) {
    try {
      const reaction = await this.prismaService.commentReaction.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId: id,
          },
        },
      });
      this.logger.log(reaction);
      if (!isLiked) {
        if (reaction) {
          return this.prismaService.commentReaction.delete({
            where: {
              userId_commentId: {
                userId,
                commentId: id,
              },
            },
          });
        }
      } else {
        if (!reaction) {
          return this.prismaService.commentReaction.create({
            data: {
              userId,
              commentId: id,
            },
          });

        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
