// backend/src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    // A senha será o hash bcrypt
    @Prop({ required: true })
    password: string;

    @Prop({ default: 'user' })
    role: string; // Ex: 'admin', 'user'

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);