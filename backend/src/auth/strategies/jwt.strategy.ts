import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

// Tipo esperado para o payload do JWT
export interface JwtPayload {
    userId: string;
    email: string;
    roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET as string,
        });
    }

    // O Passport decodifica o payload e passa para este método
    async validate(payload: JwtPayload) {
        // Busca o usuário no banco de dados para garantir que ele ainda existe
        const user = await this.userService.findById(payload.userId);

        if (!user) {
            throw new UnauthorizedException('Token inválido ou usuário não encontrado.');
        }

        // Retorna o objeto que será injetado em req.user (inclui os roles)
        return {
            userId: payload.userId,
            email: payload.email,
            roles: payload.roles
        };
    }
}