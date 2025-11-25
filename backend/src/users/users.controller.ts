// backend/src/users/users.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';

@Controller('api/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() createUserDto: CreateUserDto) {
        // Retorna o usuário criado, mas removemos a senha por segurança
        const user = await this.usersService.create(createUserDto);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const userObject = user.toJSON();
        const { password, ...result } = user.toObject();
        return result;
    }
}
