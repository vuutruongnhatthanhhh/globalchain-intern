import * as grpc from '@grpc/grpc-js';
import {
  connect,
  Contract,
  Identity,
  Signer,
  signers,
} from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';
import * as dotenv from 'dotenv';

dotenv.config();

const mspId = process.env.MSP_ID;

async function newGrpcConnection(): Promise<grpc.Client> {
  try {
    const tlsRootCert = Buffer.from(process.env.TLS_CERT || '');
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);

    const client = new grpc.Client(
      process.env.PEER_ENDPOINT || '',
      tlsCredentials,
      {
        'grpc.ssl_target_name_override': `${process.env.PEER_HOST_ALIAS}`,
      },
    );

    return client;
  } catch (error) {
    console.error('Error creating gRPC connection:', error);
    throw error;
  }
}

async function newIdentity(): Promise<{ mspId: string; credentials: Buffer }> {
  try {
    const credentials = Buffer.from(process.env.CERTIFICATE || '');
    return { mspId, credentials };
  } catch (error) {
    console.error('Error creating new identity:', error);
    throw error;
  }
}

async function newSigner(): Promise<Signer> {
  try {
    const privateKey = crypto.createPrivateKey(
      Buffer.from(process.env.PRIVATE_KEY || ''),
    );
    return signers.newPrivateKeySigner(privateKey);
  } catch (error) {
    console.error('Error creating new signer:', error);
    throw error;
  }
}

async function createGatewayAndContract(): Promise<{
  gateway: any;
  contract: Contract;
}> {
  const client = await newGrpcConnection();
  const gateway = connect({
    client,
    identity: await newIdentity(),
    signer: await newSigner(),
    evaluateOptions: () => ({ deadline: Date.now() + 5000 }), // 5 seconds
    endorseOptions: () => ({ deadline: Date.now() + 15000 }), // 15 seconds
    submitOptions: () => ({ deadline: Date.now() + 5000 }), // 5 seconds
    commitStatusOptions: () => ({ deadline: Date.now() + 60000 }), // 1 minute
  });

  const network = gateway.getNetwork(process.env.CHANNEL_NAME || '');
  const contract = network.getContract(process.env.CHAINCODE_NAME || '');

  return { gateway, contract };
}

export { createGatewayAndContract, newGrpcConnection, newIdentity, newSigner };
