import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import api from '../api/config';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Camera, FileText, CheckCircle } from 'lucide-react-native';

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

  const pickDocument = async (docKey) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocs(prev => ({ ...prev, [docKey]: result.assets[0] }));
      }
    } catch (err) {
      console.log('Picker configuration crash', err);
    }
  };

  const takePhoto = async (docKey) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert('Camera Access Denied', 'Please enable camera permissions in settings to take a live selfie.');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocs(prev => ({ ...prev, [docKey]: result.assets[0] }));
      }
    } catch (error) {
       console.log('Camera initialization failure', error);
    }
  };

  const handleUpload = async () => {
    if (!docs.identityProof || !docs.addressProof || !docs.incomeProof || !docs.photo) {
      return Alert.alert('Missing Documents', 'Please upload all 4 verification documents to proceed.');
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
      
      Alert.alert('Upload Successful', 'Verification files processed. Your application is now in queue.');
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Upload Failed', error.message || 'Network sync error.');
    } finally {
      setUploading(false);
    }
  };

  const UploadButton = ({ title, docKey, isCamera = false }) => (
    <TouchableOpacity 
      style={tw`w-full bg-white dark:bg-gray-800 p-5 rounded-2xl mb-4 border-2 border-dashed ${docs[docKey] ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'} flex-row justify-between items-center shadow-sm`}
      onPress={() => isCamera ? takePhoto(docKey) : pickDocument(docKey)}
    >
      <View style={tw`flex-row items-center`}>
        {isCamera ? <Camera color={docs[docKey] ? "#22c55e" : "#6b7280"} size={22} style={tw`mr-3`} /> : <FileText color={docs[docKey] ? "#22c55e" : "#6b7280"} size={22} style={tw`mr-3`} />}
        <View>
          <Text style={tw`font-extrabold text-gray-800 dark:text-gray-200 mb-1`}>
            {title}
          </Text>
          <Text style={tw`text-xs font-medium text-gray-400`}>
            {docs[docKey] ? '✓ Secured in memory' : (isCamera ? 'Tap here to launch device camera' : 'Tap here to browse file explorer')}
          </Text>
        </View>
      </View>
      {docs[docKey] && <CheckCircle color="#22c55e" size={24} />}
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-gray-50 dark:bg-gray-900 pt-16 px-6`}>
      <Text style={tw`text-3xl font-black text-gray-900 dark:text-white mb-2`}>Hardware Upload</Text>
      <Text style={tw`text-gray-500 font-medium mb-8`}>Securely submit verification assets.</Text>

      <UploadButton title="Identity Proof (PDF/JPG)" docKey="identityProof" />
      <UploadButton title="Address Proof (Bill/Gov ID)" docKey="addressProof" />
      <UploadButton title="Income Proof (Salary/Tax)" docKey="incomeProof" />
      <UploadButton title="Live Selfie Photo" docKey="photo" isCamera={true} />

      <TouchableOpacity 
        style={tw`w-full bg-blue-600 rounded-3xl py-4 items-center shadow-lg shadow-blue-500/30 mt-6`}
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={tw`text-white font-black text-xl`}>Submit Verification Files</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default DocumentUploadScreen;
