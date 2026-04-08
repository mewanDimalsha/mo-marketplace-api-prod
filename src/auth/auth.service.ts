import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private jwtService: JwtService,
    ) { }

    // ─── REGISTER ───────────────────────────────────────────
    async register(dto: RegisterDto) {
        // 1. Check if email already exists
        const exists = await this.userRepo.findOne({
            where: { email: dto.email },
        });
        if (exists) throw new ConflictException('Email already registered');

        // 2. Hash the password — never store plain text
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // 3. Save user to DB
        const user = this.userRepo.create({
            ...dto,
            password: hashedPassword,
        });
        await this.userRepo.save(user);

        // 4. Return both tokens
        return this.generateTokens(user);
    }

    // ─── LOGIN ──────────────────────────────────────────────
    async login(dto: LoginDto) {
        // 1. Find user by email
        const user = await this.userRepo.findOne({
            where: { email: dto.email },
        });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        // 2. Compare password with hashed version in DB
        const passwordValid = await bcrypt.compare(dto.password, user.password);
        if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

        // 3. Return both tokens
        return this.generateTokens(user);
    }

    // ─── REFRESH ────────────────────────────────────────────
    async refresh(userId: string, incomingRefreshToken: string) {
        // 1. Find user
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Access denied');
        }

        // 2. Compare incoming token with hashed one in DB
        const tokenValid = await bcrypt.compare(
            incomingRefreshToken,
            user.refreshToken,
        );
        if (!tokenValid) throw new UnauthorizedException('Access denied');

        // 3. Token is valid — issue brand new pair (token rotation)
        return this.generateTokens(user);
    }

    // ─── LOGOUT ─────────────────────────────────────────────
    async logout(userId: string) {
        // Delete refresh token from DB — session is dead
        await this.userRepo.update(userId, { refreshToken: null });
        return { message: 'Logged out successfully' };
    }

    // ─── PRIVATE: generate both tokens ──────────────────────
    private async generateTokens(user: User) {
        const payload = { sub: user.id, email: user.email };

        // Create access token — short lived
        const access_token = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });

        // Create refresh token — long lived
        const refresh_token = this.jwtService.sign(payload, {
            expiresIn: '7d',
        });

        // Hash and store refresh token in DB
        const hashedRefresh = await bcrypt.hash(refresh_token, 10);
        await this.userRepo.update(user.id, { refreshToken: hashedRefresh });

        return {
            access_token,
            refresh_token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }
}