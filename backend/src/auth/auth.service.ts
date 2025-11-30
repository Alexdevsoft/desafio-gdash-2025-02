// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../auth/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);

        if (user && (await bcrypt.compare(pass, user.password))) {
            // Retorna o usuário sem a senha para a sessão
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        // O payload inclui o email e as roles, essenciais para o RolesGuard
        const payload = { email: user.email, sub: user._id, roles: user.roles };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(createUserDto: CreateUserDto) {
        // 1. Verifica se o usuário já existe
        const existingUser = await this.usersService.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new UnauthorizedException('Usuário com este e-mail já existe.');
        }

        // 2. Cria o usuário (o UserService deve fazer o hashing da senha antes de salvar)
        const user = await this.usersService.create(createUserDto);

        // 3. Retorna o token JWT para o novo usuário
        return this.login(user);
    }
}