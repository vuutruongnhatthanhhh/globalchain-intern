import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('getAll')
  @UseGuards(AuthService)
  async getAllUsers() {
    try {
      const users = await this.userService.getAllUsers();
      return {
        status: 'OK',
        message: 'SUCCESS',
        data: users,
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: 'Failed to get all user',
      };
    }
  }
  @Get('getDetail/:id')
  @UseGuards(AuthService)
  async getDetailUsers(@Param('id') id: any) {
    try {
      const users = await this.userService.getDetailUsers(id);
      return {
        status: 'OK',
        message: 'SUCCESS',
        data: users,
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: 'Failed to get detail user',
      };
    }
  }
  @Post('create')
  @UseGuards(AuthService)
  async createUsers(@Body() user: any) {
    try {
      const result = await this.userService.createUsers(user);
      return result;
    } catch (error) {
      return {
        status: 'ERROR',
        message: 'Failed to create user',
      };
    }
  }
  @Put('update/:id')
  @UseGuards(AuthService)
  async updateUsers(@Param('id') id: string, @Body() updatedUser: any) {
    try {
      const result = await this.userService.updateUsers(id, updatedUser);
      return result;
    } catch (error) {
      return {
        status: 'ERROR',
        message: 'Failed to update user',
      };
    }
  }
  @Delete('delete/:id')
  @UseGuards(AuthService)
  async deleteUsers(@Param('id') id: any) {
    try {
      const result = await this.userService.deleteUsers(id);
      return result;
    } catch (error) {
      return {
        status: 'ERROR',
        message: 'Failed to delete user',
      };
    }
  }
}
