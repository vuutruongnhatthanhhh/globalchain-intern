import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';
import * as dotenv from 'dotenv';

dotenv.config();

const mspId: string = process.env.MSP_ID || '';
const peerEndpoint: string = process.env.PEER_ENDPOINT || '';
const peerHostAlias: string = process.env.PEER_HOST_ALIAS || '';
const certificate: string = process.env.CERTIFICATE || '';
const privateKeyy: string = process.env.PRIVATE_KEY || '';
const channelName: string = process.env.CHANNEL_NAME || '';
const chaincodeName: string = process.env.CHAINCODE_NAME || '';

async function newGrpcConnection(): Promise<grpc.Client> {
    try {
        const tlsRootCert = Buffer.from(process.env.TLS_CERT || '');
        const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
        const client = new grpc.Client(peerEndpoint, tlsCredentials, {
            'grpc.ssl_target_name_override': peerHostAlias,
        });
        return client;
    } catch (error) {
        console.error('Error creating gRPC connection:', error);
        throw error;
    }
}

async function newIdentity(): Promise<Identity> {
    try {
        const credentials = Buffer.from(certificate);
        return { mspId, credentials };
    } catch (error) {
        console.error('Error creating new identity:', error);
        throw error;
    }
}

async function newSigner(): Promise<Signer> {
    try {
        const privateKeyPem = Buffer.from(privateKeyy);
        const privateKey = crypto.createPrivateKey(privateKeyPem);
        return signers.newPrivateKeySigner(privateKey);
    } catch (error) {
        console.error('Error creating new signer:', error);
        throw error;
    }
}

async function createGatewayAndContract(): Promise<{ gateway: ReturnType<typeof connect>, contract: Contract }> {
    const client:any = await newGrpcConnection();
    const gateway = connect({
        client ,
        identity: await newIdentity(),
        signer: await newSigner(),
        evaluateOptions: () => ({ deadline: Date.now() + 5000 }), // 5 seconds
        endorseOptions: () => ({ deadline: Date.now() + 15000 }), // 15 seconds
        submitOptions: () => ({ deadline: Date.now() + 5000 }), // 5 seconds
        commitStatusOptions: () => ({ deadline: Date.now() + 60000 }), // 1 minute
    });

    const network = gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    return { gateway, contract };
}

export {
    createGatewayAndContract,
    newGrpcConnection,
    newIdentity,
    newSigner,
};
