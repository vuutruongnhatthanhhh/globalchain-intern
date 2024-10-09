const grpc = require('@grpc/grpc-js');
const { connect, Contract, Identity, Signer, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { TextDecoder } = require('util');
const dotenv = require("dotenv");
dotenv.config()

const mspId = process.env.MSP_ID


async function newGrpcConnection() {
    try {
        // const tlsRootCert = await fs.readFile(tlsCertPath);
        const tlsRootCert = Buffer.from(process.env.TLS_CERT);
        const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
        // console.log('tlsCredentials',tlsCredentials)
        const client = new grpc.Client(process.env.PEER_ENDPOINT, tlsCredentials, {
            'grpc.ssl_target_name_override': `${process.env.PEER_HOST_ALIAS}`,
        });
        
        return client;
    } catch (error) {
        console.error('Error creating gRPC connection:', error);
        throw error;
    }
}

async function newIdentity() {
    try {
        // const certPath = await getFirstDirFileName(certDirectoryPath); // Đoạn này bạn phải định nghĩa hàm getFirstDirFileName để lấy được đường dẫn của certificate
        // console.log('certPath', certPath)
        // const credentials = await fs.readFile(certPath);
        const credentials = Buffer.from(process.env.CERTIFICATE);
        // console.log('credentials', credentials)
        return { mspId, credentials };
    } catch (error) {
        console.error('Error creating new identity:', error);
        throw error;
    }
}

async function newSigner() {
    try {
        // const keyPath = await getFirstDirFileName(keyDirectoryPath); // Đoạn này cần định nghĩa keyDirectoryPath trước khi sử dụng
        // const privateKeyPem = await fs.readFile(keyPath);
        const privateKey = crypto.createPrivateKey(Buffer.from(process.env.PRIVATE_KEY));
        console.log('privateKey',signers.newPrivateKeySigner(privateKey))
        return signers.newPrivateKeySigner(privateKey);
    } catch (error) {
        console.error('Error creating new signer:', error);
        throw error;
    }
}

async function createGatewayAndContract() {
    const client = await newGrpcConnection();
    // console.log('client',client)
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    const network = gateway.getNetwork(process.env.CHANNEL_NAME);
    const contract = network.getContract(process.env.CHAINCODE_NAME);

    return { gateway, contract };
}

module.exports = {
    createGatewayAndContract,
    newGrpcConnection,
    newIdentity,
    newSigner,
};