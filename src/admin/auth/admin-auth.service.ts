import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../users/Schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { CreateAdminDto } from './dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has admin role
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Access denied. Admin privileges required.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, refreshToken: __, ...result } = user.toObject();
    return result;
  }

  async createAdmin(createAdminDto: CreateAdminDto, creatorRole: UserRole) {
    // Only super_admin can create other admins
    if (creatorRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can create admin accounts');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 12);
    
    const role = createAdminDto.role || UserRole.ADMIN;

    // Super admin can only be created by another super admin
    if (role === UserRole.SUPER_ADMIN && creatorRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot create super admin account');
    }

    try {
      const user = await this.usersService.createWithRole(
        createAdminDto.username,
        createAdminDto.email,
        hashedPassword,
        role,
      );

      const { password: _, refreshToken: __, ...result } = user.toObject();
      
      const tokens = await this.generateAdminTokens(result._id.toString(), result.email, result.role);
      await this.usersService.updateRefreshToken(result._id.toString(), tokens.refreshToken);

      return {
        admin: result,
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  async loginAdmin(user: any) {
    const tokens = await this.generateAdminTokens(user._id.toString(), user.email, user.role);
    await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      admin: user,
      ...tokens,
    };
  }

  private async generateAdminTokens(userId: string, email: string, role: UserRole) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
          type: 'admin',
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '1h', // Longer for admins
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
          type: 'admin',
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getAllUsers() {
    return this.usersService.findAll();
  }

  async deleteUser(userId: string) {
    return this.usersService.deleteUser(userId);
  }

  async updateUserRole(userId: string, role: UserRole) {
    return this.usersService.updateRole(userId, role);
  }
}

