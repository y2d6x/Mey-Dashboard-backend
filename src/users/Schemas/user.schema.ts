import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserDocument = User & Document

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    username : string;

    @Prop({ required: true, unique: true })
    email : string;

    @Prop({ required: true })
    password : string;

    @Prop({ type: String, enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Prop({ default: null})
    refreshToken : string;
}

export const UserSchema = SchemaFactory.createForClass(User);
