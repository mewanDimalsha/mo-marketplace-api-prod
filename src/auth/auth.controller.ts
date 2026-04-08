import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO for refresh endpoint
class RefreshDto {
    @ApiProperty({ example: 'your_refresh_token_here' })
    @IsString()
    refresh_token: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login — returns access + refresh tokens' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Get new access token using refresh token' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    refresh(@Request() req, @Body() body: RefreshDto) {
        // req.user is attached by JwtStrategy.validate()
        return this.authService.refresh(req.user.id, body.refresh_token);
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout — invalidates refresh token' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    logout(@Request() req) {
        return this.authService.logout(req.user.id);
    }
}