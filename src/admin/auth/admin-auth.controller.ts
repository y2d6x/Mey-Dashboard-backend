import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
  HttpStatus,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/Schemas/user.schema';
import { AdminLoginDto, CreateAdminDto } from './dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('admin')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin login',
    description:
      'Authenticate admin user with email and password. Only users with admin or super_admin role can login.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin login successful',
    schema: {
      example: {
        admin: {
          _id: '507f1f77bcf86cd799439011',
          username: 'admin_user',
          email: 'admin@mey.com',
          role: 'admin',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({
    status: 403,
    description: 'Access denied - Admin privileges required',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() adminLoginDto: AdminLoginDto) {
    const admin = await this.adminAuthService.validateAdmin(
      adminLoginDto.email,
      adminLoginDto.password,
    );
    return this.adminAuthService.loginAdmin(admin);
  }

  @Post('create-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create new admin (Super Admin only)',
    description:
      'Create a new admin or super_admin account. Only super admins can perform this action.',
  })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Super admin privileges required',
  })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async createAdmin(@Body() createAdminDto: CreateAdminDto, @Request() req) {
    const user = await this.adminAuthService['usersService'].findById(
      req.user.userId,
    );
    return this.adminAuthService.createAdmin(createAdminDto, user.role);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get admin profile',
    description: 'Retrieve the authenticated admin user profile.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin privileges required',
  })
  async getProfile(@Request() req) {
    const user = await this.adminAuthService['usersService'].findById(
      req.user.userId,
    );
    const {
      password: _password,
      refreshToken: _refreshToken,
      ...result
    } = user.toObject();
    return result;
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve all registered users (Admin only).',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin privileges required',
  })
  async getAllUsers() {
    return this.adminAuthService.getAllUsers();
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete user (Super Admin only)',
    description: 'Delete a user account by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Super admin privileges required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string) {
    return this.adminAuthService.deleteUser(id);
  }

  @Patch('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user role (Super Admin only)',
    description: "Change a user's role.",
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: ['user', 'admin', 'super_admin'],
          example: 'admin',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Super admin privileges required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.adminAuthService.updateUserRole(id, role);
  }
}
