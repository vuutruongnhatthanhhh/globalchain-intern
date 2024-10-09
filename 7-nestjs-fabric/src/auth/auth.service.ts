import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { createGatewayAndContract } from '../utils/utils';
import { promises as fs } from 'fs';
import * as dotenv from 'dotenv';
import { Observable } from 'rxjs';

dotenv.config({ path: '.env.token' });
@Injectable()
export class AuthService implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const token = process.env.TOKEN;
      if (!token) {
        return false;
      }

      const verificationResult = await this.verifyAccessToken();
      return verificationResult === 'true';
    } catch (error) {
      console.error('Error in AuthGuard:', error);
      return false;
    }
  }
  async generateAccessToken(): Promise<any> {
    try {
      const { contract } = await createGatewayAndContract();
      const resultBytes = await contract.evaluateTransaction(
        'AuthContract:GenerateAccessToken',
      );
      const utf8Decoder = new TextDecoder('utf-8');
      const resultJson = utf8Decoder.decode(resultBytes);
      await fs.writeFile('.env.token', `TOKEN=${resultJson}`);
      return resultJson;
    } catch (error) {
      console.error('Error in get access token:', error);
      throw error;
    }
  }
  async verifyAccessToken(): Promise<any> {
    try {
      const { contract } = await createGatewayAndContract();
      const resultBytes = await contract.evaluateTransaction(
        'AuthContract:VerifyAccessToken',
        process.env.TOKEN,
      );
      const utf8Decoder = new TextDecoder('utf-8');
      const resultJson = utf8Decoder.decode(resultBytes);
      return resultJson;
    } catch (error) {
      console.error('Error in get access token:', error);
      throw error;
    }
  }
}
