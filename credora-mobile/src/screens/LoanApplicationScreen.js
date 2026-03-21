import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import api from '../api/config';
import { useNavigation } from '@react-navigation/native';

const LoanApplicationScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    loan_amount: '',
    income_annum: '',
    loan_term: '5',
    no_of_dependents: '0',
    education: 'Graduate',
    self_employed: 'No',
    residential_assets_value: '0',
    commercial_assets_value: '0',
    luxury_assets_value: '0',
    bank_asset_value: '0'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.loan_amount || !formData.income_annum) {
      return Alert.alert("Missing Values", "Loan Amount and Annual Income are strictly required.");
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        loan_amount: Number(formData.loan_amount),
        income_annum: Number(formData.income_annum),
        loan_term: Number(formData.loan_term),
        no_of_dependents: Number(formData.no_of_dependents),
        residential_assets_value: Number(formData.residential_assets_value),
        commercial_assets_value: Number(formData.commercial_assets_value),
        luxury_assets_value: Number(formData.luxury_assets_value),
        bank_asset_value: Number(formData.bank_asset_value),
      };

      const response = await api.post('/api/loan/apply', payload);
      Alert.alert('AI Processed', 'Initial parameters received. Moving to document verification.');
      navigation.navigate('DocumentUpload', { applicationId: response.data.application_id });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Engine failed. Check FastAPI connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={tw`flex-1 bg-gray-50 dark:bg-gray-900 pt-16`} contentContainerStyle={tw`px-6 h-full pb-20`}>
      <Text style={tw`text-4xl font-black text-gray-900 dark:text-white mb-2`}>New Loan</Text>
      <Text style={tw`text-gray-500 font-medium mb-10`}>Advanced Application Terminal</Text>

      <Text style={tw`font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider mb-2 ml-2`}>Total Loan Amount (₹)</Text>
      <TextInput 
        style={tw`w-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl p-5 mb-6 font-black text-2xl dark:text-white text-blue-600`}
        keyboardType="numeric"
        placeholder="500000"
        placeholderTextColor="#9ca3af"
        value={formData.loan_amount}
        onChangeText={(val) => setFormData({...formData, loan_amount: val})}
      />

      <Text style={tw`font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider mb-2 ml-2`}>Annual Income (₹)</Text>
      <TextInput 
        style={tw`w-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl p-5 mb-10 font-black text-2xl dark:text-white text-green-600`}
        keyboardType="numeric"
        placeholder="1200000"
        placeholderTextColor="#9ca3af"
        value={formData.income_annum}
        onChangeText={(val) => setFormData({...formData, income_annum: val})}
      />

      <TouchableOpacity 
        style={tw`w-full bg-blue-600 rounded-2xl py-5 items-center shadow-lg shadow-blue-500/30`}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={tw`text-white font-black text-xl`}>
          {loading ? 'Authenticating...' : 'Access Hardware Verification'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LoanApplicationScreen;
