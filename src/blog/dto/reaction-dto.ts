import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
export enum LikeStatus{
    LIKE = 1,
    DEFAULT = 0,
    DISLIKE = -1,
}
export class ReactionDto {
    @IsOptional()
    @ApiProperty({
        enum: LikeStatus,
        example: LikeStatus.LIKE
    })
    likeStatus? : LikeStatus = LikeStatus.DEFAULT
}