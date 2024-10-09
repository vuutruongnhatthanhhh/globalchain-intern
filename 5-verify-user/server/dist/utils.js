"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGatewayAndContract = createGatewayAndContract;
exports.newGrpcConnection = newGrpcConnection;
exports.newIdentity = newIdentity;
exports.newSigner = newSigner;
const grpc = __importStar(require("@grpc/grpc-js"));
const fabric_gateway_1 = require("@hyperledger/fabric-gateway");
const crypto = __importStar(require("crypto"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const mspId = process.env.MSP_ID || '';
const peerEndpoint = process.env.PEER_ENDPOINT || '';
const peerHostAlias = process.env.PEER_HOST_ALIAS || '';
const certificate = process.env.CERTIFICATE || '';
const privateKeyy = process.env.PRIVATE_KEY || '';
const channelName = process.env.CHANNEL_NAME || '';
const chaincodeName = process.env.CHAINCODE_NAME || '';
function newGrpcConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tlsRootCert = Buffer.from(process.env.TLS_CERT || '');
            const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
            const client = new grpc.Client(peerEndpoint, tlsCredentials, {
                'grpc.ssl_target_name_override': peerHostAlias,
            });
            return client;
        }
        catch (error) {
            console.error('Error creating gRPC connection:', error);
            throw error;
        }
    });
}
function newIdentity() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const credentials = Buffer.from(certificate);
            return { mspId, credentials };
        }
        catch (error) {
            console.error('Error creating new identity:', error);
            throw error;
        }
    });
}
function newSigner() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const privateKeyPem = Buffer.from(privateKeyy);
            const privateKey = crypto.createPrivateKey(privateKeyPem);
            return fabric_gateway_1.signers.newPrivateKeySigner(privateKey);
        }
        catch (error) {
            console.error('Error creating new signer:', error);
            throw error;
        }
    });
}
function createGatewayAndContract() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield newGrpcConnection();
        const gateway = (0, fabric_gateway_1.connect)({
            client,
            identity: yield newIdentity(),
            signer: yield newSigner(),
            evaluateOptions: () => ({ deadline: Date.now() + 5000 }), // 5 seconds
            endorseOptions: () => ({ deadline: Date.now() + 15000 }), // 15 seconds
            submitOptions: () => ({ deadline: Date.now() + 5000 }), // 5 seconds
            commitStatusOptions: () => ({ deadline: Date.now() + 60000 }), // 1 minute
        });
        const network = gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        return { gateway, contract };
    });
}
