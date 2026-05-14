import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RefreshDto } from './dto/refresh.dto';
import { User } from './entities/user.entity';

@ApiTags('Auth') // groups all these endpoints under the "Auth" section in Swagger UI
@Controller('auth') //base route: /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register') // POST /auth/register
  @ApiOperation({ summary: 'Register a new user' }) // adds a description in Swagger UI
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto); // calls the register method in AuthService with the incoming DTO
  }

  @Post('login')
  @ApiOperation({ summary: 'Login — returns access + refresh tokens' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Get new access token using refresh token' })
  refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.refresh_token); // we only need the refresh token from the body to get a new access token
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout — invalidates refresh token' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  logout(@Request() req: { user: User }) {
    return this.authService.logout(req.user.id);
  }
}
