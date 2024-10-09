import React from 'react';
import {Button, Platform, StyleSheet, Text, View} from 'react-native';
import Evaluate from '../components/Evaluate';
import Submit from '../components/Submit';
import Register from '../components/Register';
import Verify from '../components/Verify';

export default function App() {
  return (
    <View style={styles.container}>
      <Verify />
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
