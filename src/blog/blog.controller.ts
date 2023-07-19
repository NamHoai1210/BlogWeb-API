import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, InternalServerErrorException, Param, Patch, Post, Query,Request, } from '@nestjs/common'
import { Public } from 'src/auth/decorator/public-guard.decorator'
import { LoggedUserEntity } from 'src/auth/entities/logged-user.entity'
import { CommentService } from 'src/comment/comment.service'
import { CommentEntity } from 'src/comment/entities/comment.entity'
import { BlogService } from './blog.service'
import { CreateBlogDto } from './dto/create-blog.dto'
import { FindBlogDto } from './dto/find-blog.dto'
import { BlogEntity } from './entities/blog.entity'

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly commentService: CommentService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() findBlogDto: FindBlogDto) {
    const { keyword, page, pageSize } = findBlogDto
    return this.blogService.findAll(keyword, +page, +pageSize)
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id : number):Promise<any>{
    const blog = await this.blogService.findOne(id);
    if(!blog){
        throw new BadRequestException()
    }
    return blog;
  }

  @Get('me/:id')
  async findMe(@Param('id') id : number, @Request() {user}: {user: LoggedUserEntity}):Promise<any>{
    const blog = await this.blogService.findOne(id, user.id);
    if(!blog){
        throw new BadRequestException()
    }
    return blog;
  }

  @Post()
  async createBlog(
    @Request() {user}: {user: LoggedUserEntity},
    @Body() data: CreateBlogDto,
  ):Promise<BlogEntity>{
    const ret =  await this.blogService.create(data,user.id);
    if(!ret) throw new InternalServerErrorException();
    return new BlogEntity(ret);
  }

  @Patch(':id')
  async editBlog(
    @Param('id') id : number,
    @Request() { user }: { user: LoggedUserEntity },
    @Body() updateBlogDto: CreateBlogDto
  ):Promise<BlogEntity>{
    const ret = await this.blogService.update(updateBlogDto,id,user.id)
    if(!ret) throw new InternalServerErrorException();
    return new BlogEntity(ret);
  }

  @Delete(':id')
  async deleteBlog(
    @Param('id') id : number,
    @Request() { user }: { user: LoggedUserEntity }
  ): Promise<void>{
    const blog = await this.blogService.findOne(id);
    if(!blog){
        throw new BadRequestException()
    }
    if(blog.userId !==user.id){
        throw new ForbiddenException()
    }
    await this.blogService.delete(id)
  }

}
