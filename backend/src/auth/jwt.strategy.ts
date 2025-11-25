// backend/src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../users/users.service';

// CRÍTICO: Usaremos a variável de ambiente para a chave secreta
const JWT_SECRET = process.env.JWT_SECRET || 'SEGREDO_MUITO_SECRETO_E_FORTE';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET,
        });
    }

    // O payload é o objeto contido no token JWT
    async validate(payload: any) {
        const user = await this.usersService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        // O que é retornado aqui é anexado ao objeto Request (req.user)
        // Ex: req.user = { userId: user._id, email: user.email, role: user.role }
        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}