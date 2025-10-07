import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './Schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(username: string, email: string, hashedPassword: string): Promise<UserDocument> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    }).exec();

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
    }

    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    return newUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const hashedRefreshToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken });
  }

  async findByRefreshToken(userId: string, refreshToken: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user || !user.refreshToken) {
      return null;
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    
    if (!isRefreshTokenValid) {
      return null;
    }

    return user;
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
  }

  async createWithRole(username: string, email: string, hashedPassword: string, role: UserRole): Promise<UserDocument> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    }).exec();

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
    }

    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
      role,
    });

    return await newUser.save() as UserDocument;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({}, { password: 0, refreshToken: 0 }).exec();
  }

  async deleteUser(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(userId);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async updateRole(userId: string, role: UserRole): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true, projection: { password: 0, refreshToken: 0 } }
    );
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }
}
