import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ example: 'your_refresh_token_here' })
  @IsString()
  refresh_token!: string;
}
