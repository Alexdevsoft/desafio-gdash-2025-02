// backend/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from '../auth/dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    // Usado para o registro de um novo usuário
    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        const createdUser = new this.userModel(createUserDto);
        return (await createdUser.save()).toObject({ getters: true });
    }

    // Usado pelo AuthModule para verificar as credenciais
    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    // Usado para proteger a rota de Insights (ex: retornar o usuário pelo ID)
    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }
}
