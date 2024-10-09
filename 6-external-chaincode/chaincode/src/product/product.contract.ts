/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Product} from './product.record';

@Info({title: 'ProductContract', description: 'Smart contract for product'})
export class ProductContract extends Contract {
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
