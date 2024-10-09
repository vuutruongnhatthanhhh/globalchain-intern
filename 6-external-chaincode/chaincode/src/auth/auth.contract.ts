/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import * as jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || '';

@Info({title: 'AuthContract', description: 'Smart contract for auth'})
export class AuthContract extends Contract {

@Transaction(false)
@Returns('string')
public async GenerateAccessToken(ctx: Context): Promise<string> {
    const userId = ctx.clientIdentity.getID();

    const payload = {
        userId: userId,
    };

    const options = {
        expiresIn: '365d', 
    };

    const token = jwt.sign(payload, SECRET_KEY, options);

    return token;
}

@Transaction(false)
@Returns('boolean')
public async VerifyAccessToken(ctx: Context, token: string): Promise<boolean> {
    try {
         jwt.verify(token, SECRET_KEY);
        return true;
    } catch (err) {
        return false;
    }
}
}
