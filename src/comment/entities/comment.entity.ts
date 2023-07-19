import { UserEntity } from 'src/users/entities/user.entity';

export class CommentEntity {
  id: number;
  user: UserEntity;
  bookId: string;
  content: string;
  constructor(partial: Partial<CommentEntity>) {
    Object.assign(this, partial);
  }
}
