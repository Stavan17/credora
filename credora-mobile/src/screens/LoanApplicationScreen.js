import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import tw from 'twrnc';
import api from '../api/config';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const LoanApplicationScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    loan_amount: '',
    income_annum: '',
    loan_term: '5',
    no_of_dependents: '0',
    education: 'Graduate',
    self_employed: false,
    residential_assets_value: '0',
    commercial_assets_value: '0',
    luxury_assets_value: '0',
    bank_asset_value: '0'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.loan_amount || !formData.income_annum) {
      return Alert.alert("Required Fields Missing", "Please enter Annual Income and Loan Amount.");
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
      Alert.alert('Application Submitted', 'Proceed to upload verification documents.');
      navigation.navigate('DocumentUpload', { applicationId: response.data.application_id });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Application failed to submit.');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChange, placeholder, isNumber = true }) => (
    <View style={tw`mb-5`}>
      <Text style={tw`font-bold text-gray-700 dark:text-gray-300 mb-2`}>{label}</Text>
      <TextInput 
        style={tw`w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 font-bold text-lg dark:text-white`}
        keyboardType={isNumber ? "numeric" : "default"}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );

  return (
    <ScrollView style={tw`flex-1 bg-gray-50 dark:bg-gray-900 pt-16`} contentContainerStyle={tw`px-6 pb-40`}>
      <Text style={tw`text-3xl font-black text-gray-900 dark:text-white mb-2`}>New Loan Application</Text>
      <Text style={tw`text-gray-500 font-medium mb-8`}>Fill in all required details below</Text>

      <Text style={tw`text-xl font-bold text-gray-900 dark:text-white mb-4`}>Personal Information</Text>
      
      <View style={tw`mb-5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden`}>
        <Text style={tw`font-bold text-gray-700 dark:text-gray-300 pt-3 pl-4`}>Number of Dependents *</Text>
        <Picker
          selectedValue={formData.no_of_dependents}
          onValueChange={(val) => setFormData({...formData, no_of_dependents: val})}
          style={tw`w-full text-black dark:text-white`}
          dropdownIconColor="gray"
        >
          {['0','1','2','3','4','5'].map(num => <Picker.Item key={num} label={num} value={num} />)}
        </Picker>
      </View>

      <View style={tw`mb-5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden`}>
        <Text style={tw`font-bold text-gray-700 dark:text-gray-300 pt-3 pl-4`}>Education *</Text>
        <Picker
          selectedValue={formData.education}
          onValueChange={(val) => setFormData({...formData, education: val})}
          style={tw`w-full text-black dark:text-white`}
          dropdownIconColor="gray"
        >
          <Picker.Item label="Graduate" value="Graduate" />
          <Picker.Item label="Not Graduate" value="Not Graduate" />
        </Picker>
      </View>

      <View style={tw`mb-8 flex-row items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-300 dark:border-gray-700`}>
        <Text style={tw`font-bold text-gray-700 dark:text-gray-300`}>Self Employed</Text>
        <Switch 
           value={formData.self_employed} 
           onValueChange={(val) => setFormData({...formData, self_employed: val})}
           trackColor={{ false: "#767577", true: "#2563eb" }}
        />
      </View>

      <Text style={tw`text-xl font-bold text-gray-900 dark:text-white mb-4`}>Financial Information</Text>
      
      <InputField label="Annual Income (₹) *" value={formData.income_annum} onChange={(val) => setFormData({...formData, income_annum: val})} placeholder="5000000" />
      <InputField label="Loan Amount (₹) *" value={formData.loan_amount} onChange={(val) => setFormData({...formData, loan_amount: val})} placeholder="2000000" />

      <View style={tw`mb-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden`}>
        <Text style={tw`font-bold text-gray-700 dark:text-gray-300 pt-3 pl-4`}>Loan Term (Years) *</Text>
        <Picker
          selectedValue={formData.loan_term}
          onValueChange={(val) => setFormData({...formData, loan_term: val})}
          style={tw`w-full text-black dark:text-white`}
          dropdownIconColor="gray"
        >
          {['2','3','4','5','6','7','8','9','10','15','20'].map(num => <Picker.Item key={num} label={`${num} years`} value={num} />)}
        </Picker>
      </View>

      <Text style={tw`text-xl font-bold text-gray-900 dark:text-white mb-4`}>Asset Information (Optional)</Text>
      <InputField label="Residential Assets Value (₹)" value={formData.residential_assets_value} onChange={(val) => setFormData({...formData, residential_assets_value: val})} placeholder="0" />
      <InputField label="Commercial Assets Value (₹)" value={formData.commercial_assets_value} onChange={(val) => setFormData({...formData, commercial_assets_value: val})} placeholder="0" />
      <InputField label="Luxury Assets Value (₹)" value={formData.luxury_assets_value} onChange={(val) => setFormData({...formData, luxury_assets_value: val})} placeholder="0" />
      <InputField label="Bank Assets Value (₹)" value={formData.bank_asset_value} onChange={(val) => setFormData({...formData, bank_asset_value: val})} placeholder="0" />

      <TouchableOpacity 
        style={tw`w-full bg-blue-600 rounded-xl py-5 items-center shadow-lg mt-4`}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={tw`text-white font-black text-xl`}>
          {loading ? 'Processing...' : 'Submit Application'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LoanApplicationScreen;
