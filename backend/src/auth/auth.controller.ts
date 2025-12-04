// backend/src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private usersService: UsersService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
        const user = await this.usersService.create(createUserDto);
        const { password, ...result } = user.toJSON() as any;
        return result;
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Request() req: any) {
        // Retorna o token JWT com base no usuário autenticado
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }
}