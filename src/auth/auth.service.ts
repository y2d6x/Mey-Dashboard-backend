import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const {
      password: _password,
      refreshToken: _refreshToken,
      ...result
    } = user.toObject();
    return result;
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    try {
      const user = await this.usersService.create(
        registerDto.username,
        registerDto.email,
        hashedPassword,
      );

      const {
        password: _password,
        refreshToken: _refreshToken,
        ...result
      } = user.toObject();

      const tokens = await this.generateTokens(
        result._id.toString(),
        result.email,
      );
      await this.usersService.updateRefreshToken(
        result._id.toString(),
        tokens.refreshToken,
      );

      return {
        user: result,
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  async login(user: any) {
    const tokens = await this.generateTokens(user._id.toString(), user.email);
    await this.usersService.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken,
    );

    return {
      user,
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.usersService.removeRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findByRefreshToken(
      userId,
      refreshToken,
    );

    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.generateTokens(user._id.toString(), user.email);
    await this.usersService.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken,
    );

    return tokens;
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
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

  async validateUserById(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const {
      password: _password,
      refreshToken: _refreshToken,
      ...result
    } = user.toObject();
    return result;
  }
}
