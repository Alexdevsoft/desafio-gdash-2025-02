// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService, // Injeção do UserService
        private jwtService: JwtService, // Injeção do JwtService
    ) { }

    // 1. MÉTODO DE REGISTRO (Gera o hash da senha antes de salvar)
    async register(createUserDto: CreateUserDto): Promise<UserDocument> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const userWithHashedPassword = {
            ...createUserDto,
            password: hashedPassword,
        };
        return this.userService.create(userWithHashedPassword);
    }

    // 2. MÉTODO DE VALIDAÇÃO (Usado pelo LocalStrategy)
    async validateUser(email: string, pass: string): Promise<any> {

        const user = await this.userService.findByEmail(email);

        if (user) {

            const isMatch = await bcrypt.compare(pass, user.password);

            if (isMatch) {

                const { password, ...result } = user.toObject();
                return result;
            }
        }
        // Se o usuário não existir ou a senha estiver errada
        return null;
    }

    async login(user: any) {

        const payload = {
            userId: user._id || user.userId, // Usa _id do Mongoose ou userId
            email: user.email,
            roles: user.roles || ['User'] // Garante que roles exista
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}