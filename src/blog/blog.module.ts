import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { CommentService } from 'src/comment/comment.service';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [CommentModule],
  providers: [BlogService, CommentService],
  controllers: [BlogController]
})
export class BlogModule {}
