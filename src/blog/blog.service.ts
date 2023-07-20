import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { NormalizeKeyword } from 'src/common/helper/normalize'
import { PrismaService } from 'src/db/prisma.service'
import { CreateBlogDto } from './dto/create-blog.dto'
import { LikeStatus } from './dto/reaction-dto'
import { KeywordEntity } from './entities/keyword.entity'

@Injectable()
export class BlogService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBlogDto: CreateBlogDto, userId: number) {
    try {
      const { title, content, keywords } = createBlogDto
      const blog = await this.prismaService.blog.create({
        data: {
          title,
          content,
          userId,
        },
      })
      for (const keyword of keywords) {
        const ret = await this.prismaService.keyword.upsert({
          where: {
            content: NormalizeKeyword(keyword),
          },
          create: {
            content: NormalizeKeyword(keyword),
          },
          update: {},
        })
        await this.prismaService.keywordMap.create({
          data: {
            blogId: blog.id,
            keywordId: ret.id,
          },
        })
      }
      return blog
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async update(updateBlogDto: CreateBlogDto, id: number, userId: number) {
    try {
      const { title, content, keywords } = updateBlogDto
      const blog = await this.prismaService.blog.update({
        where: { id },
        data: {
          title,
          content,
        },
      })
      await this.prismaService.keywordMap.deleteMany({
        where: {
          blogId: id,
        },
      })
      for (const keyword of keywords) {
        const { id } = await this.prismaService.keyword.upsert({
          where: {
            content: NormalizeKeyword(keyword),
          },
          create: {
            content: NormalizeKeyword(keyword),
          },
          update: {},
        })
        await this.prismaService.keywordMap.create({
          data: {
            blogId: blog.id,
            keywordId: id,
          },
        })
      }
      return blog
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async delete(id: number) {
    return this.prismaService.blog.delete({
      where: { id },
    })
  }

  async findKeyword(key: string, page: number, pageSize: number) {
    const query: Prisma.KeywordWhereInput = {}
    if (key) {
      query.content = {
        contains: key,
      }
    }

    const [total, items] = await this.prismaService.$transaction([
      this.prismaService.keyword.count(),
      this.prismaService.keyword.findMany({
        where: query,
        take: pageSize,
        skip: pageSize * (page - 1),
      }),
    ])
    return {
      total,
      items,
    }
  }

  async findAll(keyword: number, page: number, pageSize: number) {
    if (keyword) {
      const [total, items] = await this.prismaService.$transaction([
        this.prismaService.keywordMap.count({
          where: {
            keywordId: keyword,
          },
        }),
        this.prismaService.keywordMap.findMany({
          where: {
            keywordId: keyword,
          },
          include: {
            Blog: true,
          },
          take: pageSize,
          skip: pageSize * (page - 1),
        }),
      ])
      return {
        total,
        items: items.map((item) => item.Blog),
      }
    } else {
      const [total, items] = await this.prismaService.$transaction([
        this.prismaService.blog.count(),
        this.prismaService.blog.findMany({
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
      ])
      return {
        total,
        items,
      }
    }
  }

  async findByUser(userId: number, page: number, pageSize: number) {
    const [total, items] = await this.prismaService.$transaction([
      this.prismaService.blog.count({
        where: {userId}
      }),
      this.prismaService.blog.findMany({
        where: {userId},
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
    ])
    return {
      total,
      items,
    }
  }

  async findOne(id: number, userId?: number) {
    const includeQuery: any = {
      User: {
        select: {
          avatar: true,
          name: true,
        },
      },
    }
    if (userId)
      includeQuery.CommentReactions = {
        where: {
          userId,
        },
        select: {
          id: true,
        },
      }
    return this.prismaService.blog.findUnique({
      where: { id },
      include: {
        Comments: {
          include: includeQuery,
        },
      },
    })
  }

  async updateLikeCount(id: number, likeValue: number, disLikeValue: number) {
    return await this.prismaService.blog.update({
      where: {
        id,
      },
      data: {
        likeCount: {
          increment: likeValue,
        },
        disLikeCount: {
          increment: disLikeValue,
        },
      },
    })
  }

  async setLike(id: number, userId: number, likeStatus: LikeStatus) {
    const reaction = await this.prismaService.blogReaction.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId: id,
        },
      },
    })
    if (likeStatus === LikeStatus.DEFAULT) {
      if (reaction) {
        await this.prismaService.blogReaction.delete({
          where: {
            userId_blogId: {
              userId,
              blogId: id,
            },
          },
        })
        if (reaction.isLiked) return await this.updateLikeCount(id, -1, 0)
        return await this.updateLikeCount(id, 0, -1)
      }
    } else {
      if (!reaction) {
        await this.prismaService.blogReaction.create({
          data: {
            userId,
            blogId: id,
            isLiked: likeStatus === LikeStatus.LIKE ? true : false,
          },
        })
        if (likeStatus === LikeStatus.LIKE)
          return await this.updateLikeCount(id, 1, 0)
        return await this.updateLikeCount(id, 0, 1)
      } else {
        if (!reaction.isLiked && likeStatus === LikeStatus.LIKE)
          return await this.updateLikeCount(id, 1, -1)
        if (reaction.isLiked && likeStatus === LikeStatus.DISLIKE)
          return await this.updateLikeCount(id, -1, 1)
      }
    }
    return null
  }
}
