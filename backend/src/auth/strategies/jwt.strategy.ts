import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'SEGREDO_MUITO_SECRETO_E_FORTE_DO_PROJETO',
        });
    }

    // O payload é o que foi injetado pelo método login do AuthService
    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email, roles: payload.roles };
    }
}