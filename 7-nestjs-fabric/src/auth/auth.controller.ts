import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('getToken')
  async getToken() {
    try {
      const token = await this.authService.generateAccessToken();
      return {
        status: 'OK',
        message: 'SUCCESS get token',
        data: token,
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: 'Failed to generate access token',
      };
    }
  }
  @Get('verifyToken')
  async verifyToken() {
    try {
      const rs = await this.authService.verifyAccessToken();
      return {
        status: 'OK',
        message: 'SUCCESS verify',
        data: rs,
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: 'Failed to verify access token',
      };
    }
  }
}
