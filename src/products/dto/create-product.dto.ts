import { IsString, IsOptional, IsUrl, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: 'Classic T-Shirt' })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({ example: 'A comfortable everyday t-shirt', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 'https://picsum.photos/400/300', required: false })
    @IsOptional()
    @IsUrl()
    imageUrl?: string;
}