import { IsString, IsNumber, IsInt, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateVariantDto {
    @ApiProperty({ example: 'red' })
    @IsString()
    @MinLength(1)
    color: string;

    @ApiProperty({ example: 'M' })
    @IsString()
    @MinLength(1)
    size: string;

    @ApiProperty({ example: 'cotton' })
    @IsString()
    @MinLength(1)
    material: string;

    @ApiProperty({ example: 29.99 })
    @Type(() => Number)
    @IsNumber()
    @Min(0.01, { message: 'Price must be greater than 0' })
    price: number;

    @ApiProperty({ example: 10 })
    @Type(() => Number)
    @IsInt()
    @Min(0, { message: 'Stock cannot be negative' })
    stock: number;
}