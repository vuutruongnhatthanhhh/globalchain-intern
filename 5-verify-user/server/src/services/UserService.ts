import FabricCAServices from 'fabric-ca-client';
import { Wallet, Wallets } from 'fabric-network';
import path from 'path';
import { Buffer } from 'buffer';
import dotenv from 'dotenv';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import { TextDecoder } from 'util';
import { createGatewayAndContract } from '../utils';
dotenv.config();

interface RegisterResult {
    privateKey?: string;
    certificate?: string;
    error?: string;
}

const walletPath = path.join(__dirname, 'wallet');
const mspOrg1 = process.env.MSP ?? '';

const adminUserId = process.env.ADMIN_ID ?? '';
const adminUserPasswd = process.env.ADMIN_PASS ?? '';

const caTls: string = process.env.CA_TLS ?? '';
const caName: string = process.env.CA_NAME ?? '';
const urlCaServer: string = process.env.URL_CA_SERVER ?? '';

const buildCAClient = (): FabricCAServices => {
    return new FabricCAServices(urlCaServer, { trustedRoots: [caTls], verify: false }, caName);
};

const buildWallet = async (walletPath?: string): Promise<Wallet> => {
    if (walletPath) {
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Built a file system wallet at ${walletPath}`);
        return wallet;
    } else {
        const wallet = await Wallets.newInMemoryWallet();
        console.log('Built an in-memory wallet');
        return wallet;
    }
};

const registerAndEnrollUser = async (
    caClient: FabricCAServices,
    wallet: Wallet,
    orgMspId: string,
    userId: string,
    affiliation: string
): Promise<RegisterResult> => {
    try {
        const userIdentity = await wallet.get(userId);
        if (userIdentity) {
            console.log(`An identity for the user ${userId} already exists in the wallet`);
            return {};
        }

        const adminIdentity = await wallet.get(adminUserId);
        if (!adminIdentity) {
            console.log('An identity for the admin user does not exist in the wallet');
            console.log('Enroll the admin user before retrying');
            return {};
        }

        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

        const secret = await caClient.register({
            affiliation,
            enrollmentID: userId,
            role: 'client',
        }, adminUser);

        const enrollment = await caClient.enroll({
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

        await wallet.put(userId, x509Identity);
        console.log(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);

        return {
            privateKey: enrollment.key.toBytes(),
            certificate: enrollment.certificate,
        };
    } catch (error) {
        console.error(`Failed to register user: ${error}`);
        return { error: `Failed to register user: ${error}` };
    }
};

const createKey = async (user: string): Promise<{ status: string; data?: RegisterResult; message?: string }> => {
    try {
        const caClient = buildCAClient();
        const wallet = await buildWallet(walletPath);
        const result = await registerAndEnrollUser(caClient, wallet, mspOrg1, user, 'org1.department1');

        if (result.privateKey && result.certificate) {
            return {
                status: 'OK',
                data: result
            };
        } else {
            return {
                status: 'ERROR',
                message: 'Failed to get privateKey and certificate',
            };
        }
    } catch (error) {
        return {
            status: 'ERROR',
            message: `Failed to create key: ${error}`,
        };
    }
};

async function verifyUser(contract: Contract, accessToken: string): Promise<string> {
    try {
        console.log('\n--> Evaluate Transaction: VerifyAccessToken, with provided access token.');
        const resultBytes = await contract.evaluateTransaction('VerifyAccessToken', accessToken);

        const utf8Decoder = new TextDecoder('utf-8');
        const resultJson = utf8Decoder.decode(resultBytes);

        console.log('*** Result:', resultJson);
        return resultJson; // Trả về kết quả JSON
    } catch (error) {
        console.error('Error in getAllUserBlockchain:', error);
        throw error;
    }
}

async function getAllUserBlockchain(contract: Contract): Promise<string> {
    try {
        console.log('\n--> Evaluate Transaction: GetAllUser');
        const resultBytes = await contract.evaluateTransaction('GetAllUser');

        const utf8Decoder = new TextDecoder('utf-8');
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        console.log('*** Result:', result);
        return result; 
    } catch (error) {
        console.error('Error in getAllUserBlockchain:', error);
        throw error;
    }
}

async function getAllUser(token: string) : Promise<any>  {
    try {
        const { contract } = await createGatewayAndContract();
        const verify = await verifyUser(contract,token)
       
    if(verify==='true'){
        const result = await getAllUserBlockchain(contract);
        return result;
    }else{
        return {
            status: 'ERROR',
            message: `invalid access token`,
        };
    }
       
    } catch (e) {
        throw new Error(`Failed to get all users: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
};

export { buildCAClient, buildWallet, registerAndEnrollUser, createKey,verifyUser, getAllUser};
