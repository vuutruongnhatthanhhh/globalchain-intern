import React from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import App2 from './App2';
import App3 from './App3';
const { PingPongServicePromiseClient } = require('./ping_pong_grpc_web_pb');
const { PingRequest } = require('./ping_pong_pb');

const serverUrl = 'http://172.20.0.205:9090';
const promiseClient = new PingPongServicePromiseClient(serverUrl, null, null);

const callGrpcServicePromise = async () => {
  const request = new PingRequest();
  request.setPing('Ping');
  try {
    const result = await promiseClient.pingPong(request, {});
    console.log('this is the result', result.getPong());
  } catch (error) {
    console.error(error);
  }
};

export default function App() {
  return (
   
    <View style={styles.container}>
      {/* <Text>Connect grpc simple</Text> 
      <Button title="GRPC" onPress={callGrpcServicePromise} /> */}
       <App2/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
