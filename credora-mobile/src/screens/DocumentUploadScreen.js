import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import api from '../api/config';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';

const DocumentUploadScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { applicationId } = route.params;

  const [docs, setDocs] = useState({
    identityProof: null,
    addressProof: null,
    incomeProof: null,
    photo: null
  });
  const [uploading, setUploading] = useState(false);

  const pickDocument = async (docType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocs(prev => ({ ...prev, [docType]: result.assets[0] }));
      }
    } catch (err) {
      console.log('Picker configuration crash', err);
    }
  };

  const handleUpload = async () => {
    if (!docs.identityProof || !docs.addressProof || !docs.incomeProof || !docs.photo) {
      return Alert.alert('Required Missing', 'Upload ALL 4 physical documents otherwise OCR will flag as missing.');
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Object.keys(docs).forEach(key => {
        const asset = docs[key];
        formData.append(key, {
          uri: asset.uri,
          name: asset.name || `${key}.jpg`,
          type: asset.mimeType || 'image/jpeg'
        });
      });

      await api.post(`/api/loan/documents/${applicationId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      Alert.alert('OCR Deployed', 'Documents synced! Neural Network analysis complete. Returning to Dashboard.');
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Sync Blocked', error.message || 'Payload rejected. Verify network latency.');
    } finally {
      setUploading(false);
    }
  };

  const UploadButton = ({ title, docKey }) => (
    <TouchableOpacity 
      style={tw`w-full bg-white dark:bg-gray-800 p-6 rounded-3xl mb-4 border-2 border-dashed ${docs[docKey] ? 'border-green-500' : 'border-gray-200 dark:border-gray-600'} flex-row justify-between items-center shadow-sm`}
      onPress={() => pickDocument(docKey)}
    >
      <View>
        <Text style={tw`font-extrabold text-lg ${docs[docKey] ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'} mb-1`}>
          {title}
        </Text>
        <Text style={tw`text-xs font-medium text-gray-400`}>
          {docs[docKey] ? '✓ Linked perfectly in RAM.' : 'Tap to mount from Native File Explorer'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-gray-50 dark:bg-gray-900 pt-16 px-6`}>
      <Text style={tw`text-3xl font-black text-gray-900 dark:text-white mb-2`}>Hardware Sync</Text>
      <Text style={tw`text-gray-500 font-medium mb-8`}>Intercept exact files natively.</Text>

      <UploadButton title="Identity Proof" docKey="identityProof" />
      <UploadButton title="Address Proof" docKey="addressProof" />
      <UploadButton title="Income Proof" docKey="incomeProof" />
      <UploadButton title="Selfie Photo" docKey="photo" />

      <TouchableOpacity 
        style={tw`w-full bg-blue-600 rounded-3xl py-5 items-center shadow-lg shadow-blue-500/20 mt-6`}
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={tw`text-white font-black text-xl`}>Transmit Payloads to API</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default DocumentUploadScreen;
