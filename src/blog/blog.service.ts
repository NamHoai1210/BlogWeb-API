import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/db/prisma.service'
import { CreateBlogDto } from './dto/create-blog.dto'
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
            content: keyword.toUpperCase(),
          },
          create: {
            content: keyword.toUpperCase(),
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
            content: keyword.toUpperCase(),
          },
          create: {
            content: keyword.toUpperCase(),
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

  async findAll(keyword: string, page: number, pageSize: number) {
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
}
