import React, {useState} from 'react';

import FabricGateway from '../libs/fabric/FabricGateway';
import {Button, Platform, StyleSheet, Text, View, FlatList} from 'react-native';

const GRPC_SERVER_URL = 'http://172.20.0.205:9090';
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

const myArray: string[] = [
  '5',
  'thienphuc',
  '123',
  'Ka Ân Thiên Phúc',
  '075202001346',
  '19/11/2002',
  'thienphuc@gmail.com',
  '0',
];

const App3: React.FC = () => {
  const [users, setUsers] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const client = new FabricGateway(
    privateKeyPem,
    certificate,
    GRPC_SERVER_URL,
    'Org1MSP',
    'mychannel',
    'verify6',
  );

  const handleEvaluateRequest = async () => {
    try {
      const users = await client.submit(['CreateUser', ...(myArray ?? [])]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View>
      <Text style={{fontSize: 24}}>SubmitTransaction</Text>
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

export default App3;
