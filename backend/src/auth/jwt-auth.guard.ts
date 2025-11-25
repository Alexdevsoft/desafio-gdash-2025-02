// backend/src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 'jwt' é o nome da estratégia que definimos (JwtStrategy)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }