// backend/src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

        // Se não houver roles definidos (ou se o decorator Roles não foi usado)
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        // Supondo que o token JWT injeta o usuário no objeto de request
        const user = request.user;

        // Verifica se o usuário tem pelo menos uma das roles necessárias
        return requiredRoles.some((role) => user.roles?.includes(role));
    }
}