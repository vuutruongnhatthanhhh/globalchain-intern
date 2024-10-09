/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';



@Object()
export class Product {
    @Property()
    public productId: string = '';

    @Property()
    public name: string = '';

    @Property()
    public description: string = '';

    @Property()
    public price: number = 0;

    @Property()
    public quantity: number = 0;
}
