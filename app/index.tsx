import React, { useState } from 'react';
import {
  Alert,
  Button,
  NativeModules,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const {QRCodeScannerModule} = NativeModules;

const App = () => {
  const [scanResult, setScanResult] = useState('');

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to scan QR codes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const onScanPress = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes.');
      return;
    }

    try {
      setScanResult(''); 
      const result = await QRCodeScannerModule.scanQRCode();
      setScanResult(result);
    } catch (error) {
      console.error(error);
      if (error.code !== 'E_SCAN_CANCELLED') {
        Alert.alert('Error', 'Failed to scan QR code.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>React Native QR Scanner</Text>
        <Button title="Scan QR Code" onPress={onScanPress} />
        {scanResult ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Scanned Result:</Text>
            <Text style={styles.resultText}>{scanResult}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  resultContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultText: {
    marginTop: 8,
    fontSize: 18,
    color: '#000',
  },
});

export default App;
