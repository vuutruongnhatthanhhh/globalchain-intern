import { Injectable } from '@nestjs/common';
import { createGatewayAndContract } from '../utils/utils';

@Injectable()
export class UsersService {
  async getAllUsers(): Promise<any> {
    try {
      const { contract } = await createGatewayAndContract();
      const resultBytes = await contract.evaluateTransaction('GetAllUser');

      const utf8Decoder = new TextDecoder('utf-8');
      const resultJson = utf8Decoder.decode(resultBytes);
      const result = JSON.parse(resultJson);

      return result;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }
  async getDetailUsers(id: any): Promise<any> {
    try {
      const { contract } = await createGatewayAndContract();
      const resultBytes = await contract.evaluateTransaction('ReadUser', id);

      const utf8Decoder = new TextDecoder('utf-8');
      const resultJson = utf8Decoder.decode(resultBytes);
      const result = JSON.parse(resultJson);

      return result;
    } catch (error) {
      console.error('Error in getDetailUser:', error);
      throw error;
    }
  }
  async createUsers(user: any): Promise<any> {
    try {
      const { contract } = await createGatewayAndContract();
      const {
        id,
        username,
        password,
        name,
        citizenID,
        birthDay,
        email,
        isAdmin,
      } = user;
      await contract.submitTransaction(
        'CreateUser',
        id,
        username,
        password,
        name,
        citizenID,
        birthDay,
        email,
        isAdmin,
      );
      return {
        status: 'OK',
        message: 'SUCCESS TO CREATE USER',
      };
    } catch (error) {
      console.error('Error in create user', error);
      throw error;
    }
  }
  async updateUsers(id: string, updatedUser: any): Promise<any> {
    try {
      const { contract } = await createGatewayAndContract();
      const { username, password, name, citizenID, birthDay, email, isAdmin } =
        updatedUser;
      await contract.submitTransaction(
        'UpdateUser',
        id,
        username,
        password,
        name,
        citizenID,
        birthDay,
        email,
        isAdmin,
      );
      return {
        status: 'OK',
        message: 'SUCCESS TO UPDATE USER',
      };
    } catch (error) {
      console.error('Error in update user', error);
      throw error;
    }
  }
  async deleteUsers(id: any): Promise<any> {
    try {
      const { contract } = await createGatewayAndContract();

      await contract.submitTransaction('DeleteUser', id);
      return {
        status: 'OK',
        message: 'SUCCESS TO DELETE USER',
      };
    } catch (error) {
      console.error('Error in delete user', error);
      throw error;
    }
  }
}
