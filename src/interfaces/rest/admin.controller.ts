import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { KeycloakAuthGuard } from '../../infrastructure/auth/keycloak.guard';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Roles } from '../../infrastructure/auth/roles.decorator';

interface UserRequest {
  user?: {
    sub?: string;
    preferred_username?: string;
  };
}

@Controller('api/admin')
@UseGuards(KeycloakAuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles('admin')
  getDashboard() {
    return {
      message: 'Welcome to Admin Dashboard',
      data: {
        users: 150,
        cars: 45,
        orders: 230,
      },
    };
  }

  @Post('users/block')
  @Roles('admin', 'moderator')
  blockUser(@Body() body: { userId: string }) {
    return {
      success: true,
      message: `User ${body.userId} has been blocked`,
    };
  }

  @Get('analytics')
  @Roles('admin', 'analyst')
  getAnalytics(@Req() req: Request) {
    const user = (req as UserRequest & Request).user;
    return {
      message: 'Analytics Report',
      generatedBy: user?.preferred_username || 'unknown',
      timestamp: new Date().toISOString(),
      data: {
        totalRevenue: 125000000,
        newCustomers: 234,
        activeListings: 567,
      },
    };
  }
}
