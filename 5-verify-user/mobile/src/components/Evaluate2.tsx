import React, {useState} from 'react';
// import FabricGateway from '../libs/fabric/FabricGateway';
import {Button, Platform, StyleSheet, Text, View, FlatList} from 'react-native';
import FabricGateway from 'fabric-gateway-nhatthanh2801';
const GRPC_SERVER_URL = 'http://172.20.0.205:9090';
const mspId: string = 'Org1MSP';
const certificate: string = `-----BEGIN CERTIFICATE-----
MIICpjCCAk2gAwIBAgIUdywsICSa9JOfAb5WogeEoCr/ptQwCgYIKoZIzj0EAwIw
cDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH
EwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh
Lm9yZzEuZXhhbXBsZS5jb20wHhcNMjQwODI2MDExMjAwWhcNMjUwODI2MDExNzAw
WjBdMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExFDASBgNV
BAoTC0h5cGVybGVkZ2VyMQ8wDQYDVQQLEwZjbGllbnQxDjAMBgNVBAMTBXVzZXIx
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9AFnC00YkaYsrZPYzJGXYCvO7RVp
zq6DnOBWhvEpAWK/OPMNM4xx64FVF9b82MAaOaUO1UIwMvax+QVeq+ALqKOB1zCB
1DAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUkvQtVBS6
FaFN7WoUxDpPzlVqmAAwHwYDVR0jBBgwFoAUhEvFISQ3cMmcE9uUlkTA+D7zD6kw
GgYDVR0RBBMwEYIPZGV2LWdsb2JhbGNoYWluMFgGCCoDBAUGBwgBBEx7ImF0dHJz
Ijp7ImhmLkFmZmlsaWF0aW9uIjoiIiwiaGYuRW5yb2xsbWVudElEIjoidXNlcjEi
LCJoZi5UeXBlIjoiY2xpZW50In19MAoGCCqGSM49BAMCA0cAMEQCIDq4Hx4wk+sz
MfAd1eh6XU2dByoz8GuFi1aPIGjMDO8GAiAGiRcvQ2rfcdbVY822YK8Or+0HgIvR
Pv9Frf67EgGhzQ==
-----END CERTIFICATE-----`;
const privateKeyPem: string = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgaTHUFKatNZTEtY3o
gfBVKRocSVsjFbfzCRsyKZ4mcsehRANCAAT0AWcLTRiRpiytk9jMkZdgK87tFWnO
roOc4FaG8SkBYr848w0zjHHrgVUX1vzYwBo5pQ7VQjAy9rH5BV6r4Auo
-----END PRIVATE KEY-----`;

const App2: React.FC = () => {
  const [users, setUsers] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const decodeArray = (encodedArray: number[]): string => {
    const decodedChars: string[] = encodedArray.map((num: number) =>
      String.fromCharCode(num),
    );
    return decodedChars.join('');
  };

  const client = new FabricGateway(
    privateKeyPem,
    certificate,
    GRPC_SERVER_URL,
    'Org1MSP',
    'mychannel',
    'basic',
  );

  const handleEvaluateRequest = async () => {
    try {
      const users = await client.evaluate(['GetAllUser']);
      // const users = await client.evaluate(['ReadUser','2']);
      console.log('Users:', decodeArray(users));
      setUsers(decodeArray(users));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View>
      <Text style={{fontSize: 24}}>Evaluate20</Text>
      {error && <Text style={{color: 'red'}}>Error: {error}</Text>}
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => <Text>{item}</Text>}
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
