"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKey = exports.registerAndEnrollUser = exports.buildWallet = exports.buildCAClient = void 0;
exports.verifyUser = verifyUser;
exports.getAllUser = getAllUser;
const fabric_ca_client_1 = __importDefault(require("fabric-ca-client"));
const fabric_network_1 = require("fabric-network");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const util_1 = require("util");
const utils_1 = require("../utils");
dotenv_1.default.config();
const walletPath = path_1.default.join(__dirname, 'wallet');
const mspOrg1 = (_a = process.env.MSP) !== null && _a !== void 0 ? _a : '';
const adminUserId = (_b = process.env.ADMIN_ID) !== null && _b !== void 0 ? _b : '';
const adminUserPasswd = (_c = process.env.ADMIN_PASS) !== null && _c !== void 0 ? _c : '';
const caTls = (_d = process.env.CA_TLS) !== null && _d !== void 0 ? _d : '';
const caName = (_e = process.env.CA_NAME) !== null && _e !== void 0 ? _e : '';
const urlCaServer = (_f = process.env.URL_CA_SERVER) !== null && _f !== void 0 ? _f : '';
const buildCAClient = () => {
    return new fabric_ca_client_1.default(urlCaServer, { trustedRoots: [caTls], verify: false }, caName);
};
exports.buildCAClient = buildCAClient;
const buildWallet = (walletPath) => __awaiter(void 0, void 0, void 0, function* () {
    if (walletPath) {
        const wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
        console.log(`Built a file system wallet at ${walletPath}`);
        return wallet;
    }
    else {
        const wallet = yield fabric_network_1.Wallets.newInMemoryWallet();
        console.log('Built an in-memory wallet');
        return wallet;
    }
});
exports.buildWallet = buildWallet;
const registerAndEnrollUser = (caClient, wallet, orgMspId, userId, affiliation) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userIdentity = yield wallet.get(userId);
        if (userIdentity) {
            console.log(`An identity for the user ${userId} already exists in the wallet`);
            return {};
        }
        const adminIdentity = yield wallet.get(adminUserId);
        if (!adminIdentity) {
            console.log('An identity for the admin user does not exist in the wallet');
            console.log('Enroll the admin user before retrying');
            return {};
        }
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = yield provider.getUserContext(adminIdentity, adminUserId);
        const secret = yield caClient.register({
            affiliation,
            enrollmentID: userId,
            role: 'client',
        }, adminUser);
        const enrollment = yield caClient.enroll({
            enrollmentID: userId,
            enrollmentSecret: secret,
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMspId,
            type: 'X.509',
        };
        yield wallet.put(userId, x509Identity);
        console.log(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);
        return {
            privateKey: enrollment.key.toBytes(),
            certificate: enrollment.certificate,
        };
    }
    catch (error) {
        console.error(`Failed to register user: ${error}`);
        return { error: `Failed to register user: ${error}` };
    }
});
exports.registerAndEnrollUser = registerAndEnrollUser;
const createKey = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const caClient = buildCAClient();
        const wallet = yield buildWallet(walletPath);
        const result = yield registerAndEnrollUser(caClient, wallet, mspOrg1, user, 'org1.department1');
        if (result.privateKey && result.certificate) {
            return {
                status: 'OK',
                data: result
            };
        }
        else {
            return {
                status: 'ERROR',
                message: 'Failed to get privateKey and certificate',
            };
        }
    }
    catch (error) {
        return {
            status: 'ERROR',
            message: `Failed to create key: ${error}`,
        };
    }
});
exports.createKey = createKey;
function verifyUser(contract, accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('\n--> Evaluate Transaction: VerifyAccessToken, with provided access token.');
            const resultBytes = yield contract.evaluateTransaction('VerifyAccessToken', accessToken);
            const utf8Decoder = new util_1.TextDecoder('utf-8');
            const resultJson = utf8Decoder.decode(resultBytes);
            console.log('*** Result:', resultJson);
            return resultJson; // Trả về kết quả JSON
        }
        catch (error) {
            console.error('Error in getAllUserBlockchain:', error);
            throw error;
        }
    });
}
function getAllUserBlockchain(contract) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('\n--> Evaluate Transaction: GetAllUser');
            const resultBytes = yield contract.evaluateTransaction('GetAllUser');
            const utf8Decoder = new util_1.TextDecoder('utf-8');
            const resultJson = utf8Decoder.decode(resultBytes);
            const result = JSON.parse(resultJson);
            console.log('*** Result:', result);
            return result;
        }
        catch (error) {
            console.error('Error in getAllUserBlockchain:', error);
            throw error;
        }
    });
}
function getAllUser(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { contract } = yield (0, utils_1.createGatewayAndContract)();
            const verify = yield verifyUser(contract, token);
            if (verify === 'true') {
                const result = yield getAllUserBlockchain(contract);
                return result;
            }
            else {
                return {
                    status: 'ERROR',
                    message: `invalid access token`,
                };
            }
        }
        catch (e) {
            throw new Error(`Failed to get all users: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    });
}
;
