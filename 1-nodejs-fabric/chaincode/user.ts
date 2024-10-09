/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class User {
    @Property()
    public userId: string = '';

    @Property()
    public username: string = '';

    @Property()
    public password: string = '';

    @Property()
    public name: string = '';

    @Property()
    public citizenID: string = '';

    @Property()
    public birthDay: string = '';

    @Property()
    public email: string = '';

    @Property()
    public role: number = 0;
}


