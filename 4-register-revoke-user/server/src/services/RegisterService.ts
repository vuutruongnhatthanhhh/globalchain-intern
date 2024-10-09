import FabricCAServices from "fabric-ca-client";
import { Wallet, Wallets } from "fabric-network";
import path from "path";
import { Buffer } from "buffer";
import dotenv from "dotenv";
dotenv.config();

interface RegisterResult {
  privateKey?: string;
  certificate?: string;
  error?: string;
}

const walletPath = path.join(__dirname, "wallet");
const mspOrg1 = process.env.MSP ?? "";

const adminUserId = process.env.ADMIN_ID ?? "";
const adminUserPasswd = process.env.ADMIN_PASS ?? "";

const caTls: string = process.env.CA_TLS ?? "";
const caName: string = process.env.CA_NAME ?? "";
const urlCaServer: string = process.env.URL_CA_SERVER ?? "";

const buildCAClient = (): FabricCAServices => {
  return new FabricCAServices(
    urlCaServer,
    { trustedRoots: [caTls], verify: false },
    caName
  );
};

const buildWallet = async (walletPath?: string): Promise<Wallet> => {
  if (walletPath) {
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Built a file system wallet at ${walletPath}`);
    return wallet;
  } else {
    const wallet = await Wallets.newInMemoryWallet();
    console.log("Built an in-memory wallet");
    return wallet;
  }
};

const enrollAdmin = async (
  caClient: FabricCAServices,
  wallet: Wallet,
  orgMspId: string
): Promise<RegisterResult> => {
  try {
    // Check to see if we've already enrolled the admin user.
    const identity = await wallet.get(adminUserId);
    if (identity) {
      console.log(
        "An identity for the admin user already exists in the wallet"
      );
      return {}; // Return an empty object if the admin user is already enrolled
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await caClient.enroll({
      enrollmentID: adminUserId,
      enrollmentSecret: adminUserPasswd,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMspId,
      type: "X.509",
    };
    await wallet.put(adminUserId, x509Identity);
    console.log(
      "Successfully enrolled admin user and imported it into the wallet"
    );
    return {
      // Return the result including the certificate and private key
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    };
  } catch (error) {
    console.error(`Failed to enroll admin user: ${error}`);
    const errorMessage = (error as Error).message || "Unknown error";
    return { error: errorMessage }; // Return the error message
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
      console.log(
        `An identity for the user ${userId} already exists in the wallet`
      );
      return {};
    }

    const adminIdentity = await wallet.get(adminUserId);
    if (!adminIdentity) {
      console.log(
        "An identity for the admin user does not exist in the wallet"
      );
      console.log("Enroll the admin user before retrying");
      return {};
    }

    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

    const secret = await caClient.register(
      {
        affiliation,
        enrollmentID: userId,
        role: "client",
      },
      adminUser
    );

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
      type: "X.509",
    };

    await wallet.put(userId, x509Identity);
    console.log(
      `Successfully registered and enrolled user ${userId} and imported it into the wallet`
    );

    return {
      privateKey: enrollment.key.toBytes(),
      certificate: enrollment.certificate,
    };
  } catch (error) {
    console.error(`Failed to register user: ${error}`);
    return { error: `Failed to register user: ${error}` };
  }
};

// Tạo key
const createKey = async (
  user: string
): Promise<{ status: string; data?: RegisterResult; message?: string }> => {
  try {
    const caClient = buildCAClient();
    const wallet = await buildWallet(walletPath);
    const result = await registerAndEnrollUser(
      caClient,
      wallet,
      mspOrg1,
      user,
      "org1.department1"
    );

    if (result.privateKey && result.certificate) {
      return {
        status: "OK",
        data: result,
      };
    } else {
      return {
        status: "ERROR",
        message: "Failed to get privateKey and certificate",
      };
    }
  } catch (error) {
    return {
      status: "ERROR",
      message: `Failed to create key: ${error}`,
    };
  }
};

const createKeyAdmin = async (): Promise<{
  status: string;
  data?: RegisterResult;
  message?: string;
}> => {
  try {
    const caClient = buildCAClient();
    const wallet = await buildWallet(walletPath);
    const result = await enrollAdmin(caClient, wallet, mspOrg1);

    if (result.privateKey && result.certificate) {
      return {
        status: "OK",
        data: result,
      };
    } else {
      return {
        status: "ERROR",
        message: "Failed to get privateKey and certificate",
      };
    }
  } catch (error) {
    return {
      status: "ERROR",
      message: `Failed to create key: ${error}`,
    };
  }
};

export {
  buildCAClient,
  buildWallet,
  registerAndEnrollUser,
  createKey,
  createKeyAdmin,
};
