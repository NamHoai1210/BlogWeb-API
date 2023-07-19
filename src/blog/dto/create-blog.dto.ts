import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateBlogDto{

    @IsString()
    @ApiProperty({
        description: 'Blog Title',
        example: 'Blog Title'
    })
    @IsNotEmpty()
    title: string

    @IsString()
    @ApiProperty({
        description: 'HTML Text of Blog',
        example: '<h1>Hello World</h1>'
    })
    @IsNotEmpty()
    content: string

    @IsArray()
    @ApiProperty({
        description: 'List of keywords',
        example: [
            'Web app',
            'Javascript',
            'Nodejs',
            'ExpressJs',
            'Mysql'
        ]
    })
    @IsOptional()
    keywords?: string[] = []
    
}