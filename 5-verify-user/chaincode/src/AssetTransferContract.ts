/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import * as jwt from 'jsonwebtoken';
import sortKeysRecursive from 'sort-keys-recursive';
import {User} from './user';
import {Product} from './product';
import * as dotenv from 'dotenv';

dotenv.config();


const SECRET_KEY = process.env.SECRET_KEY || ''

@Info({title: 'AssetTransfer', description: 'Smart contract for trading assets'})
export class AssetTransferContract extends Contract {

    
   

    // CreateAsset issues a new asset to the world state with given details.
    
    @Transaction()
    public async CreateUser(ctx: Context, userId: string, username: string, password: string, name: string, citizenID: string, birthDay: string, email: string, role: number): Promise<void> {
        const userKey = `user:${userId}`;
        const exists = await this.UserExists(ctx, userKey);
        if (exists) {
            throw new Error(`The user ${userId} already exists`);
        }

        const user = {
            UserId: userId,
            Username: username,
            Password: password,
            Name: name,
            CitizenID: citizenID,
            BirthDay: birthDay,
            Email: email,
            Role: role
        };
        await ctx.stub.putState(userKey, Buffer.from(stringify(sortKeysRecursive(user))));
    }


    // ReadUser returns the user stored in the world state with given id.
@Transaction(false)
public async ReadUser(ctx: Context, id: string): Promise<string> {
    const userKey = `user:${id}`;
    const assetJSON = await ctx.stub.getState(userKey); // get the user from chaincode state
    if (assetJSON.length === 0) {
        throw new Error(`The user ${id} does not exist`);
    }
    return assetJSON.toString();
}

// UpdateUser updates an existing user in the world state with provided parameters.
@Transaction()
public async UpdateUser(ctx: Context, userId: string, username: string, password: string, name: string, citizenID: string, birthDay: string, email: string, role: number): Promise<void> {
    const userKey = `user:${userId}`;
    const exists = await this.UserExists(ctx, userId);
    if (!exists) {
        throw new Error(`The user ${userId} does not exist`);
    }

    // overwriting original user with new user
    const updatedUser = {
        UserId: userId,
        Username: username,
        Password: password,
        Name: name,
        CitizenID: citizenID,
        BirthDay: birthDay,
        Email: email,
        Role: role
    };
    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    return ctx.stub.putState(userKey, Buffer.from(stringify(sortKeysRecursive(updatedUser))));
}

// DeleteUser deletes a given user from the world state.
@Transaction()
public async DeleteUser(ctx: Context, id: string): Promise<void> {
    const userKey = `user:${id}`;
    const exists = await this.UserExists(ctx, id);
    if (!exists) {
        throw new Error(`The user ${id} does not exist`);
    }
    return ctx.stub.deleteState(userKey);
}

// UserExists returns true when user with given ID exists in world state.
@Transaction(false)
@Returns('boolean')
public async UserExists(ctx: Context, id: string): Promise<boolean> {
    const userKey = `user:${id}`;
    const assetJSON = await ctx.stub.getState(userKey);
    return assetJSON.length > 0;
}

// GetAllUser returns all users found in the world state.
@Transaction(false)
@Returns('string')
public async GetAllUser(ctx: Context): Promise<string> {
    const allResults = [];

     // Get user ID from client identity
    //  const userId = ctx.clientIdentity.getID();

    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange('user:', 'user:zzzzzzzzzzzzzzzzzzzz');
    let result = await iterator.next();
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue) as User;
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        allResults.push(record);
        result = await iterator.next();
    }
    return JSON.stringify(allResults);
    
}

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




  @Transaction()
    public async CreateProduct(ctx: Context, productId: string, name: string, description: string, price: number, quantity: number): Promise<void> {
        const productKey = `product:${productId}`;
        const exists = await this.ProductExists(ctx, productKey);
        if (exists) {
            throw new Error(`The product ${productId} already exists`);
        }

        const product = {
            productId,
            name,
            description,
            price,
            quantity
        };
        await ctx.stub.putState(productKey, Buffer.from(stringify(sortKeysRecursive(product))));
    }

   // Hàm đọc Product
@Transaction(false)
public async ReadProduct(ctx: Context, productId: string): Promise<string> {
    const productKey = `product:${productId}`;
    const productJSON = await ctx.stub.getState(productKey);
    if (!productJSON || productJSON.length === 0) {
        throw new Error(`The product ${productId} does not exist`);
    }
    return productJSON.toString();
}

// Hàm cập nhật Product
@Transaction()
public async UpdateProduct(ctx: Context, productId: string, name: string, description: string, price: number, quantity: number): Promise<void> {
    const productKey = `product:${productId}`;
    const exists = await this.ProductExists(ctx, productId);
    if (!exists) {
        throw new Error(`The product ${productId} does not exist`);
    }

    const updatedProduct = {
        productId,
        name,
        description,
        price,
        quantity
    };
    await ctx.stub.putState(productKey, Buffer.from(stringify(sortKeysRecursive(updatedProduct))));
}

// Hàm xóa Product
@Transaction()
public async DeleteProduct(ctx: Context, productId: string): Promise<void> {
    const productKey = `product:${productId}`;
    const exists = await this.ProductExists(ctx, productId);
    if (!exists) {
        throw new Error(`The product ${productId} does not exist`);
    }
    return ctx.stub.deleteState(productKey);
}

// Hàm kiểm tra Product tồn tại
@Transaction(false)
@Returns('boolean')
public async ProductExists(ctx: Context, productId: string): Promise<boolean> {
    const productKey = `product:${productId}`;
    const productJSON = await ctx.stub.getState(productKey);
    return productJSON && productJSON.length > 0;
}

// Hàm lấy tất cả các Product
@Transaction(false)
@Returns('string')
public async GetAllProducts(ctx: Context): Promise<string> {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('product:', 'product:zzzzzzzzzzzzzzzzzzzz');
    let result = await iterator.next();
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue) as Product;
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        allResults.push(record);
        result = await iterator.next();
    }
    return JSON.stringify(allResults);
}



}
