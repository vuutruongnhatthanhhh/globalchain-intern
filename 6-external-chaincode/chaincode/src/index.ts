/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {type Contract} from 'fabric-contract-api';
import {UserContract} from './user/user.contract';
import {ProductContract} from './product/product.contract';
import {AuthContract} from './auth/auth.contract';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

export const contracts: typeof Contract[] = [UserContract, ProductContract, AuthContract];
