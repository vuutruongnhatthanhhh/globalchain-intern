import React from 'react';
import { View, Button, Alert, PermissionsAndroid } from 'react-native';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';

const Register: React.FC = () => {
    const register = async () => {
        try {
            
            const response = await axios.post('http://10.0.2.2:3001/api/user/register', { user: "appUser27" });
            
            

            const cert = response.data.data.certificate;
            const privateKey = response.data.data.privateKey;

            
            await EncryptedStorage.setItem('certificate', cert);
            console.log('Certificate saved to Encrypted Storage');

         
            await EncryptedStorage.setItem('privateKey', privateKey);
            console.log('Private Key saved to Encrypted Storage');

            // Alert.alert('Success', 'Certificate and private key saved securely!');

        } catch (error) {
            Alert.alert('Error', 'User is already exists');
            console.log(error);
        }
    };


    const getKey = async () => {
        try {
            const cert = await EncryptedStorage.getItem('certificate');
            const privateKey = await EncryptedStorage.getItem('privateKey');
            console.log('Certificate:', cert);
            console.log('Private Key:', privateKey);
        } catch (error) {
            console.error('Failed to retrieve data', error);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="Đăng ký" onPress={register} />
        </View>
    );
};

export default Register;