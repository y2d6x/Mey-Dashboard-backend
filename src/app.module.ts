import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { AdminAuthModule } from './admin/auth/admin-auth.module';

@Module({
  imports: [
    // Environment variables - must be first
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    
    // Rate limiting - 100 requests per 15 minutes per IP (global)
    ThrottlerModule.forRoot([{
      ttl: 900000, // 15 minutes in milliseconds
      limit: 100, // Max requests per time window
    }]),
    
    // Database
    DatabaseModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    AdminAuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
