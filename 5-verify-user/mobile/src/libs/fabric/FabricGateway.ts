const {
  EvaluateRequest,
  EndorseRequest,
  ProposedTransaction,
  PreparedTransaction,
  SubmitRequest,
  CommitStatusRequest,
  SignedCommitStatusRequest,
} = require('./protos/gateway_pb');
const {
  SignedProposal,
  Proposal,
  ChaincodeProposalPayload,
  ChaincodeHeaderExtension,
} = require('./protos/peer/proposal_pb');
const {
  ChaincodeID,
  ChaincodeInvocationSpec,
  ChaincodeSpec,
  ChaincodeInput,
} = require('./protos/peer/chaincode_pb');
const {SerializedIdentity} = require('./protos/msp/identities_pb');
const {
  ChannelHeader,
  Header,
  SignatureHeader,
} = require('./protos/common/common_pb');
import {GatewayPromiseClient} from './protos/gateway_grpc_web_pb';
import {md as _md, util} from 'node-forge';
import {Timestamp} from 'google-protobuf/google/protobuf/timestamp_pb';
import {KEYUTIL} from 'jsrsasign';
import {p256} from '@noble/curves/p256';
import {Buffer} from 'buffer';

interface FabricGatewayOptions {
  privateKeyPem: string;
  publickey: string;
  grpcServerUrl: string;
  mspid: string;
  channelId: string;
  chaincodeName: string;
}

class FabricGateway {
  private client: GatewayPromiseClient;

  constructor(
    private privateKeyPem: string,
    private publickey: string,
    private grpcServerUrl: string,
    private mspid: string,
    private channelId: string,
    private chaincodeName: string,
  ) {
    this.client = new GatewayPromiseClient(grpcServerUrl, null, null);
  }

  private asBytes(value: string | Buffer): Buffer {
    return typeof value === 'string' ? Buffer.from(value) : value;
  }

  private generateRandomBytes(size: number): Uint8Array {
    if (size <= 0) {
      throw new Error('Size must be a positive integer');
    }

    const bytes = new Uint8Array(size);

    for (let i = 0; i < size; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }

    return bytes;
  }

  private generateNonce(): Uint8Array {
    return this.generateRandomBytes(24);
  }

  private generateTransactionId(
    nonce: Uint8Array,
    creator: Uint8Array,
  ): string {
    const saltedCreator = Buffer.concat([nonce, creator]);
    const md = _md.sha256.create();
    md.update(saltedCreator.toString('binary'));
    return Buffer.from(md.digest().toHex()).toString('utf-8');
  }

  private createProposal(args: string[]): {
    signedProposal: typeof SignedProposal;
    transactionId: string;
    proposedTransaction: typeof ProposedTransaction;
    creator: Uint8Array;
  } {
    const credentials = Buffer.from(this.publickey);
    const serializedIdentity = new SerializedIdentity();
    serializedIdentity.setMspid(this.mspid);
    serializedIdentity.setIdBytes(new Uint8Array(credentials));

    const creator = new Uint8Array(serializedIdentity.serializeBinary());
    const nonce = this.generateNonce();
    const transactionId = this.generateTransactionId(nonce, creator);

    const channelHeader = new ChannelHeader();
    channelHeader.setType(3);
    channelHeader.setTxId(transactionId);
    channelHeader.setTimestamp(Timestamp.fromDate(new Date()));
    channelHeader.setChannelId(this.channelId);

    const chaincodeId = new ChaincodeID();
    chaincodeId.setName(this.chaincodeName);

    const chaincodeHeaderExtension = new ChaincodeHeaderExtension();
    chaincodeHeaderExtension.setChaincodeId(chaincodeId);
    channelHeader.setExtension$(chaincodeHeaderExtension.serializeBinary());
    channelHeader.setEpoch(0);

    const header = new Header();
    header.setChannelHeader(channelHeader.serializeBinary());

    const signatureHeader = new SignatureHeader();
    signatureHeader.setCreator(creator);
    signatureHeader.setNonce(nonce);
    header.setSignatureHeader(signatureHeader.serializeBinary());

    const proposal = new Proposal();
    proposal.setHeader(header.serializeBinary());

    const chaincodeInput = new ChaincodeInput();
    chaincodeInput.setArgsList(args.map(arg => Buffer.from(arg)));

    const chaincodeSpec = new ChaincodeSpec();
    chaincodeSpec.setType(2);
    chaincodeSpec.setChaincodeId(chaincodeId);
    chaincodeSpec.setInput(chaincodeInput);

    const chaincodeInvocationSpec = new ChaincodeInvocationSpec();
    chaincodeInvocationSpec.setChaincodeSpec(chaincodeSpec);

    const chaincodeProposalPayload = new ChaincodeProposalPayload();
    chaincodeProposalPayload.setInput(
      chaincodeInvocationSpec.serializeBinary(),
    );

    const transientMap = chaincodeProposalPayload.getTransientmapMap();
    for (const [key, value] of Object.entries(this.getTransientData())) {
      transientMap.set(key, value);
    }

    proposal.setPayload(chaincodeProposalPayload.serializeBinary());

    const signedProposal = new SignedProposal();
    signedProposal.setProposalBytes(proposal.serializeBinary());

    const proposedTransaction = new ProposedTransaction();
    proposedTransaction.setProposal(signedProposal);
    proposedTransaction.setTransactionId(transactionId);

    const bytes = signedProposal.getProposalBytes_asU8();
    const digest = this.hashToUint8Array(bytes);

    const jwk = KEYUTIL.getJWK(this.privateKeyPem);
    const rsaJwk = jwk as unknown as {d: string};
    const privateKey = Buffer.from(rsaJwk.d, 'base64');
    const sign = p256.sign(digest, privateKey, {lowS: true});
    const signature = sign.toDERRawBytes();

    signedProposal.setSignature(signature);

    return {
      signedProposal,
      transactionId,
      proposedTransaction,
      creator,
    };
  }

  async evaluate(args: string[]): Promise<number[]> {
    const {signedProposal, transactionId, proposedTransaction} =
      this.createProposal(args);

    const request = new EvaluateRequest();
    request.setTransactionId(transactionId);
    request.setChannelId(this.channelId);
    request.setProposedTransaction(signedProposal);
    request.setTargetOrganizationsList(
      proposedTransaction.getEndorsingOrganizationsList(),
    );

    try {
      const response = await this.client.evaluate(request, {});
      const result = response.getResult();
      return Array.from(result?.getPayload_asU8() ?? new Uint8Array(0));
    } catch (error) {
      throw new Error('Error evaluating chaincode: ' + error);
    }
  }

  async submit(args: string[]): Promise<any> {
    const {signedProposal, transactionId, proposedTransaction, creator} =
      this.createProposal(args);

    const endorse = new EndorseRequest();
    endorse.setTransactionId(proposedTransaction.getTransactionId());
    endorse.setChannelId(this.channelId);
    endorse.setProposedTransaction(signedProposal);
    endorse.setEndorsingOrganizationsList(
      proposedTransaction.getEndorsingOrganizationsList(),
    );

    try {
      const endorseResponse = await this.client.endorse(endorse, {});
      const txEnvelope = endorseResponse.getPreparedTransaction();

      const prepare = new PreparedTransaction();
      prepare.setEnvelope(txEnvelope);
      prepare.setTransactionId(proposedTransaction.getTransactionId());

      const envelope = prepare.getEnvelope();
      const payload = envelope.getPayload_asU8();
      const digest2 = this.hashToUint8Array(payload);

      const jwk = KEYUTIL.getJWK(this.privateKeyPem);
      const rsaJwk = jwk as unknown as {d: string};
      const privateKey = Buffer.from(rsaJwk.d, 'base64');
      const sign2 = p256.sign(digest2, privateKey, {lowS: true});
      const signature2 = sign2.toDERRawBytes();

      envelope.setSignature(signature2);

      const submitRequest = new SubmitRequest();
      submitRequest.setTransactionId(prepare.getTransactionId());
      submitRequest.setChannelId(this.channelId);
      submitRequest.setPreparedTransaction(envelope);

      await this.client.submit(submitRequest, {});

      const commitStatusRequest = new CommitStatusRequest();
      commitStatusRequest.setChannelId(this.channelId);
      commitStatusRequest.setTransactionId(prepare.getTransactionId());
      commitStatusRequest.setIdentity(creator);

      const signedCommitStatusRequest = new SignedCommitStatusRequest();
      signedCommitStatusRequest.setRequest(
        commitStatusRequest.serializeBinary(),
      );

      const request = signedCommitStatusRequest.getRequest_asU8();
      const digest3 = this.hashToUint8Array(request);
      const sign3 = p256.sign(digest3, privateKey, {lowS: true});
      const signature3 = sign3.toDERRawBytes();

      signedCommitStatusRequest.setSignature(signature3);

      const commitStatusResponse = await this.client.commitStatus(
        signedCommitStatusRequest,
        {},
      );

      return commitStatusResponse;
    } catch (error) {
      throw new Error('Error submitting transaction: ' + error);
    }
  }

  private hashToUint8Array(input: string | Buffer | Uint8Array): Uint8Array {
    const md = _md.sha256.create();
    if (typeof input === 'string') {
      md.update(input, 'utf8');
    } else if (input instanceof Buffer) {
      md.update(util.createBuffer(input).getBytes(), 'raw');
    } else if (input instanceof Uint8Array) {
      md.update(util.createBuffer(input).getBytes(), 'raw');
    } else {
      throw new Error('Unsupported input type');
    }

    const hashBytes = md.digest().getBytes();
    const uint8Array = new Uint8Array(hashBytes.length);
    for (let i = 0; i < hashBytes.length; i++) {
      uint8Array[i] = hashBytes.charCodeAt(i) & 0xff;
    }

    return uint8Array;
  }

  private getTransientData(
    transientData?: Record<string, Buffer>,
  ): Record<string, Uint8Array> {
    const result: Record<string, Uint8Array> = {};
    if (transientData) {
      for (const [key, value] of Object.entries(transientData)) {
        result[key] = new Uint8Array(value);
      }
    }
    return result;
  }
}

export default FabricGateway;
