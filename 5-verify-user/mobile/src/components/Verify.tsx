import React, {useState} from 'react';

import {Button, Platform, StyleSheet, Text, View, FlatList} from 'react-native';
import axios from 'axios';
import FabricGateway from '../libs/fabric/FabricGateway';

const GRPC_SERVER_URL = 'http://172.20.0.205:9090';
const mspId: string = 'Org1MSP';
const certificate: string = `-----BEGIN CERTIFICATE-----\nMIIChzCCAi6gAwIBAgIUDHUc0sABRE6+a4SRT6CXaX7zmMUwCgYIKoZIzj0EAwIw\ncDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\nEwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjQwNzE2MTQxNjAwWhcNMjUwODE2MDMyNDAw\nWjBGMTAwCwYDVQQLEwRvcmcxMA0GA1UECxMGY2xpZW50MBIGA1UECxMLZGVwYXJ0\nbWVudDExEjAQBgNVBAMTCWFwcFVzZXIyMDBZMBMGByqGSM49AgEGCCqGSM49AwEH\nA0IABELZjNguNFliTIJfsyK9a0DDvTTuWDTtAcZAi8JeiAIA/SQXI0B3iQejeAW/\nIWoRHODwtqYhOT/cQPdTS4+YT4yjgc8wgcwwDgYDVR0PAQH/BAQDAgeAMAwGA1Ud\nEwEB/wQCMAAwHQYDVR0OBBYEFJomdJeAz8B8XE2g0pY90vNm0XaHMB8GA1UdIwQY\nMBaAFNkzAnvFXcDmF+eoVhyhS73aQTGuMGwGCCoDBAUGBwgBBGB7ImF0dHJzIjp7\nImhmLkFmZmlsaWF0aW9uIjoib3JnMS5kZXBhcnRtZW50MSIsImhmLkVucm9sbG1l\nbnRJRCI6ImFwcFVzZXIyMCIsImhmLlR5cGUiOiJjbGllbnQifX0wCgYIKoZIzj0E\nAwIDRwAwRAIgUP2KQujTDGQs4h57OiT09mmSenVlPswggFF53Rn80+0CIBFsYDHd\nBBNI4xytNR8VSbkm8wgp9N8NZ+zyo80DEHE7\n-----END CERTIFICATE-----\n`;
const privateKeyPem: string = `-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg6wTBBW8bNHpJtrDy\r\nK2vqD5fQ/r7odAJByNv3NQ3yhKShRANCAARC2YzYLjRZYkyCX7MivWtAw7007lg0\r\n7QHGQIvCXogCAP0kFyNAd4kHo3gFvyFqERzg8LamITk/3ED3U0uPmE+M\r\n-----END PRIVATE KEY-----\r\n`;

const App2: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [users, setUser] = useState<string>('');
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
    'verify6',
  );

  const handleEvaluateRequest = async () => {
    try {
      const token = await client.evaluate(['GenerateAccessToken']);
      console.log('token:', decodeArray(token));
      setToken(decodeArray(token));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getAllUser = async () => {
    try {
      const response = await axios.post(
        'http://10.0.2.2:3001/api/user/getAllUser',
        {token: token},
      );
      console.log('All user: ', response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View>
      <Text style={{fontSize: 24}}>Get AccessToken</Text>
      {error && <Text style={{color: 'red'}}>Error: {error}</Text>}
      <FlatList
        data={token}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => <Text>{item}</Text>}
        horizontal={true}
      />

      <Button
        title={loading ? 'Loading...' : 'Send Request!'}
        onPress={handleEvaluateRequest}
      />

      <Text style={{fontSize: 24}}>GetAll</Text>
      {error && <Text style={{color: 'red'}}>Error: {error}</Text>}
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => <Text>{item}</Text>}
        horizontal={true}
      />

      <Button
        title={loading ? 'Loading...' : 'Send Request!'}
        onPress={getAllUser}
      />
    </View>
  );
};

export default App2;
