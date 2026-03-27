import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { authService } from '../services/authService';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!email || !password || !fullName) return Alert.alert('Error', 'Please enter all fields');
    setLoading(true);
    try {
      await authService.register({ email, password, full_name: fullName });
      Alert.alert('Success', 'Account created! Please log in.');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.detail || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-gray-50 dark:bg-gray-900`}
    >
      <ScrollView contentContainerStyle={tw`flex-grow justify-center items-center px-6 py-10`} keyboardShouldPersistTaps="handled">
        <Text style={tw`text-3xl font-black text-gray-900 dark:text-white mb-2`}>Create Account</Text>
        <Text style={tw`text-sm text-gray-500 mb-8`}>Join the Credora Ecosystem</Text>
        
        <View style={tw`w-full bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700`}>
          <Text style={tw`text-gray-700 dark:text-gray-300 font-bold mb-2`}>Full Name</Text>
          <TextInput 
            style={tw`w-full border border-gray-300 dark:border-gray-600 dark:text-white rounded-xl p-4 mb-4 bg-gray-50 dark:bg-gray-700`}
            placeholder="John Doe"
            placeholderTextColor="#9ca3af"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={tw`text-gray-700 dark:text-gray-300 font-bold mb-2`}>Email Address</Text>
          <TextInput 
            style={tw`w-full border border-gray-300 dark:border-gray-600 dark:text-white rounded-xl p-4 mb-4 bg-gray-50 dark:bg-gray-700`}
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={tw`text-gray-700 dark:text-gray-300 font-bold mb-2`}>Password</Text>
          <TextInput 
            style={tw`w-full border border-gray-300 dark:border-gray-600 dark:text-white rounded-xl p-4 mb-6 bg-gray-50 dark:bg-gray-700`}
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            style={tw`w-full bg-blue-600 rounded-xl py-4 items-center shadow-md`}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={tw`text-white font-bold text-lg`}>
              {loading ? 'Registering...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={tw`mt-5 items-center`} onPress={() => navigation.navigate('Login')}>
             <Text style={tw`text-blue-600 dark:text-blue-400 font-bold`}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
