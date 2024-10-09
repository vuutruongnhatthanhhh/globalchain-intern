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
exports.revokeCertificate = void 0;
const fabric_network_1 = require("fabric-network");
const path_1 = __importDefault(require("path"));
const fabric_ca_client_1 = __importDefault(require("fabric-ca-client"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const walletPath = path_1.default.join(__dirname, 'wallet');
const mspOrg1 = (_a = process.env.MSP) !== null && _a !== void 0 ? _a : '';
const adminUserId = (_b = process.env.ADMIN_ID) !== null && _b !== void 0 ? _b : '';
const adminUserPasswd = (_c = process.env.ADMIN_PASS) !== null && _c !== void 0 ? _c : '';
const caTls = (_d = process.env.CA_TLS) !== null && _d !== void 0 ? _d : '';
const caName = (_e = process.env.CA_NAME) !== null && _e !== void 0 ? _e : '';
const urlCaServer = (_f = process.env.URL_CA_SERVER) !== null && _f !== void 0 ? _f : '';
// const userId = 'userToRemove';
const buildCAClient = () => {
    return new fabric_ca_client_1.default(urlCaServer, { trustedRoots: [caTls], verify: false }, caName);
};
const removeUserFromWallet = (walletPath, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
        // Xóa người dùng khỏi wallet
        yield wallet.remove(userId);
        console.log(`Successfully removed user ${userId} from wallet.`);
    }
    catch (error) {
        console.error(`Failed to remove user ${userId}: ${error}`);
    }
});
const revokeCertificate = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield removeUserFromWallet(walletPath, userId);
        const caClient = buildCAClient();
        const wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
        // Lấy admin user từ wallet
        const adminIdentity = yield wallet.get(adminUserId);
        if (!adminIdentity) {
            throw new Error('Admin user not found in wallet');
        }
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = yield provider.getUserContext(adminIdentity, adminUserId);
        // Thu hồi chứng chỉ của người dùng
        yield caClient.revoke({ enrollmentID: userId }, adminUser);
        // Tạo CRL
        yield caClient.generateCRL({}, adminUser);
        console.log(`Successfully revoked certificate for user ${userId}`);
        return {
            status: 'OK',
            userId
        };
    }
    catch (error) {
        console.error(`Failed to revoke certificate for user ${userId}: ${error}`);
        return {
            status: 'ERROR',
            userId
        };
    }
});
exports.revokeCertificate = revokeCertificate;
