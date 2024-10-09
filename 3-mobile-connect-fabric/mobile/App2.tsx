import React, { useState } from 'react';
import { GatewayPromiseClient } from './gateway_grpc_web_pb';
const { EvaluateRequest, EndorseRequest, ProposedTransaction } = require('./gateway_pb');
const { SignedProposal, Proposal, ChaincodeProposalPayload, ChaincodeHeaderExtension } = require('./peer/proposal_pb');
const { ChaincodeID, ChaincodeInvocationSpec, ChaincodeSpec, ChaincodeInput } = require('./peer/chaincode_pb');
const { SerializedIdentity } = require('./msp/identities_pb');
const { ChannelHeader, HeaderType, Header, SignatureHeader } = require('./common/common_pb');
import { Button, Platform, StyleSheet, Text, View, FlatList } from 'react-native';
import { Buffer } from 'buffer';
import timestamp_pb_1 from "google-protobuf/google/protobuf/timestamp_pb";
import forge, { pki, util } from 'node-forge';
import { KEYUTIL, KJUR } from 'jsrsasign';
import { p256 } from '@noble/curves/p256';
import { p384 } from '@noble/curves/p384';

const GRPC_SERVER_URL = 'http://172.20.0.205:9090'
const mspId: string = 'Org1MSP';
const certificate: string = `-----BEGIN CERTIFICATE-----
MIICpjCCAk2gAwIBAgIUX7xwCJSaAzi6IzF7vbPXwT6NWXIwCgYIKoZIzj0EAwIw
cDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH
EwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh
Lm9yZzEuZXhhbXBsZS5jb20wHhcNMjQwNzE2MTQxNjAwWhcNMjUwNzE2MTQyMTAw
WjBdMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExFDASBgNV
BAoTC0h5cGVybGVkZ2VyMQ8wDQYDVQQLEwZjbGllbnQxDjAMBgNVBAMTBXVzZXIx
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEhW8XmlMzFFyps9dNBjLeXWDZwBfQ
q7vswZrt49APHzTOv7ubd9dLBXD36xRn0mS9tHEcx6px1aJuJQSbd6LthKOB1zCB
1DAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUVi1NcFCr
jlwa4zjRbHe/HRWeUxwwHwYDVR0jBBgwFoAU2TMCe8VdwOYX56hWHKFLvdpBMa4w
GgYDVR0RBBMwEYIPZGV2LWdsb2JhbGNoYWluMFgGCCoDBAUGBwgBBEx7ImF0dHJz
Ijp7ImhmLkFmZmlsaWF0aW9uIjoiIiwiaGYuRW5yb2xsbWVudElEIjoidXNlcjEi
LCJoZi5UeXBlIjoiY2xpZW50In19MAoGCCqGSM49BAMCA0cAMEQCIDtAnKC9zGP7
GFjJim0FD4VDhIymKQOFEybKfTogxn2DAiAXwzz5aVsGHAzCe0rJwkoln5qnQPsj
DAZGELBnocAZxA==
-----END CERTIFICATE-----`;
const privateKeyPem: string = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgKkNftYNuhHPY4ghb
UVxzM7ffKLxefANnvCDh82YwQOehRANCAASFbxeaUzMUXKmz100GMt5dYNnAF9Cr
u+zBmu3j0A8fNM6/u5t310sFcPfrFGfSZL20cRzHqnHVom4lBJt3ou2E
-----END PRIVATE KEY-----`;

const App2: React.FC = () => {
  const [users, setUsers] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function generateRandomBytes(size: number): Uint8Array {
    if (size <= 0) {
      throw new Error('Size must be a positive integer');
    }

    const bytes = new Uint8Array(size);

    for (let i = 0; i < size; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }

    return bytes;
  }

  function asBytes(value: string | Buffer): Buffer {
    return typeof value === 'string' ? Buffer.from(value) : value;
  }

  type TransientData = Record<string, any>;

  function getTransientData(transientData: TransientData | null | undefined): Record<string, Uint8Array> {
    const result: Record<string, Uint8Array> = {};
    for (const [key, value] of Object.entries(transientData ?? {})) {
      result[key] = asBytes(value);
    }

    return result;
  }

  function hashToUint8Array(input: string | Buffer | Uint8Array): Uint8Array {
    const md = forge.md.sha256.create();
    if (typeof input === 'string') {
      md.update(input, 'utf8');
    } else if (input instanceof Buffer) {
      md.update(forge.util.createBuffer(input).getBytes(), 'raw');
    } else if (input instanceof Uint8Array) {
      md.update(forge.util.createBuffer(input).getBytes(), 'raw');
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

  const handleEvaluateRequest = () => {
    const credentials = Buffer.from(certificate)
    const serializedIdentity = new SerializedIdentity();
    serializedIdentity.setMspid('Org1MSP')
    serializedIdentity.setIdBytes(new Uint8Array(credentials))

    const creator = new Uint8Array(serializedIdentity.serializeBinary())

    // const nonce = Buffer.from([0x91, 0xbe, 0x58, 0x30, 0x9d, 0x2c, 0x19, 0x58, 0xd4, 0xb5, 0xd4, 0x90, 0x7f, 0xeb, 0x6a, 0xeb, 0x2b, 0x2d, 0x9e, 0x0a, 0xfd, 0x74, 0x60, 0xcb])
    const nonce = Buffer.from(generateRandomBytes(24))
    const saltedCreator = Buffer.concat([nonce, creator]);
    let md = forge.md.sha256.create();
    const rawTransactionId = md.update(saltedCreator.toString('binary'));;
    const transactionId = Buffer.from(md.digest().toHex()).toString('utf-8');

    const channelHeader = new ChannelHeader();
    channelHeader.setType(3)
    channelHeader.setTxId(transactionId)

    // const specificDate = new Date('2024-08-06T00:00:00Z');
    // const specificTimestamp = timestamp_pb_1.Timestamp.fromDate(specificDate);
    channelHeader.setTimestamp(timestamp_pb_1.Timestamp.fromDate(new Date()))
    channelHeader.setChannelId('mychannel')

    const chaincodeId = new ChaincodeID();
    chaincodeId.setName('basic')

    const chaincodeHeaderExtension = new ChaincodeHeaderExtension();
    chaincodeHeaderExtension.setChaincodeId(chaincodeId)

    channelHeader.setExtension$(chaincodeHeaderExtension.serializeBinary())
    channelHeader.setEpoch(0)

    const header = new Header()
    header.setChannelHeader(channelHeader.serializeBinary())

    const signatureHeader = new SignatureHeader()
    signatureHeader.setCreator(creator)
    signatureHeader.setNonce(nonce)

    header.setSignatureHeader(signatureHeader.serializeBinary())

    const proposal = new Proposal();
    proposal.setHeader(header.serializeBinary())
    const argsAsBytes = Array.of('GetAllUser').map(asBytes)
    // const argsAsBytes = Array.of('GetAllProducts').map(asBytes)
    // const argsAsBytes = Array.of('ReadUser', '1').map(asBytes)
    // const argsAsBytes = Array.of('ReadProduct','2').map(asBytes)

    const chaincodeInput = new ChaincodeInput();
    chaincodeInput.setArgsList(argsAsBytes)

    const chaincodeSpec = new ChaincodeSpec()
    chaincodeSpec.setType(2)
    chaincodeSpec.setChaincodeId(chaincodeId)

    chaincodeSpec.setInput(chaincodeInput)

    const chaincodeInvocationSpec = new ChaincodeInvocationSpec()
    chaincodeInvocationSpec.setChaincodeSpec(chaincodeSpec)

    const chaincodeProposalPayload = new ChaincodeProposalPayload();
    chaincodeProposalPayload.setInput(chaincodeInvocationSpec.serializeBinary())
    const transientMap = chaincodeProposalPayload.getTransientmapMap();

    for (const [key, value] of Object.entries(getTransientData)) {
      transientMap.set(key, value);
    }

    proposal.setPayload(chaincodeProposalPayload.serializeBinary())

    const signedProposal = new SignedProposal();
    signedProposal.setProposalBytes(proposal.serializeBinary())

    const proposedTransaction = new ProposedTransaction()
    proposedTransaction.setProposal(signedProposal)
    proposedTransaction.setTransactionId(transactionId)

    const bytes = signedProposal.getProposalBytes_asU8();
    const digest = hashToUint8Array(bytes)

    const jwk: any = KEYUTIL.getJWK(privateKeyPem);
    const privateKey = Buffer.from(jwk.d, 'base64');
    const sign = p256.sign(digest, privateKey, { lowS: true });
    const signature = sign.toDERRawBytes()

    signedProposal.setSignature(signature)

    const client = new GatewayPromiseClient(GRPC_SERVER_URL, null, {
      'grpc.ssl_target_name_override': `peer0.org1.example.com`,
    });

    const request = new EvaluateRequest();
    request.setTransactionId(proposedTransaction.getTransactionId());
    request.setChannelId('mychannel');
    request.setProposedTransaction(signedProposal);
    request.setTargetOrganizationsList(proposedTransaction.getEndorsingOrganizationsList());

    const encodedArray: number[] = [91, 123, 34, 66, 105, 114, 116, 104, 68, 97, 121, 34, 58, 34, 50, 56, 47, 48, 49, 47, 50, 48, 48, 50, 34, 44, 34, 67, 105, 116, 105, 122, 101, 110, 73, 68, 34, 58, 34, 48, 55, 53, 50, 48, 50, 48, 48, 49, 51, 52, 54, 34, 44, 34, 69, 109, 97, 105, 108, 34, 58, 34, 97, 100, 109, 105, 110, 64, 103, 109, 97, 105, 108, 46, 99, 111, 109, 34, 44, 34, 78, 97, 109, 101, 34, 58, 34, 66, 225, 186, 161, 99, 32, 104, 195, 160, 32, 114, 225, 187, 171, 110, 103, 34, 44, 34, 80, 97, 115, 115, 119, 111, 114, 100, 34, 58, 34, 49, 50, 51, 34, 44, 34, 82, 111, 108, 101, 34, 58, 48, 44, 34, 85, 115, 101, 114, 73, 100, 34, 58, 34, 49, 34, 44, 34, 85, 115, 101, 114, 110, 97, 109, 101, 34, 58, 34, 110, 104, 97, 116, 116, 104, 97, 110, 104, 34, 125, 93];

    const decodeArray = (encodedArray: number[]): string => {
      const decodedChars: string[] = encodedArray.map((num: number) => String.fromCharCode(num));
      return decodedChars.join('');
    };

    let hasError = false;

    client.evaluate(request, {})
      .then(response => {
        const userlist = response.getResult();
        const encodedArray2: number[] = Array.from(userlist?.getPayload_asU8() ?? new Uint8Array(0));
        setUsers(decodeArray(encodedArray2));
        console.log('users', users);
      })
      .catch(err => {
        hasError = true;
      })
      .finally(() => {
        setLoading(false);
        if (!hasError) {
          setError(null);
        }
      });
  };

  return (
    <View>
      <Text style={{ fontSize: 24 }}>Evaluate</Text>
      {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text>{item}</Text>
        )}
        horizontal={true}
      />

      <Button
        title={loading ? 'Loading...' : 'Send Request!'}
        onPress={handleEvaluateRequest}
      />
    </View>
  );
};

export default App2;
