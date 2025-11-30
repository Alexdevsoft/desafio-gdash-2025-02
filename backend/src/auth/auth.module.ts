// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy'; // Criaremos este arquivo
import { LocalStrategy } from './strategies/local.strategy';

// CRÍTICO: Usaremos a variável de ambiente para a chave secreta
const JWT_SECRET = process.env.JWT_SECRET || 'SEGREDO_MUITO_SECRETO_E_FORTE';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET || 'SEGREDO_MUITO_SECRETO_E_FORTE_DO_PROJETO',
      signOptions: { expiresIn: '60m' }, // Token expira em 60 minutos
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule { }