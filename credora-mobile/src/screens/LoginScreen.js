import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import tw from 'twrnc';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please enter all fields');
    setLoading(true);
    try {
      await login({ username: email, password });
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.detail || 'Invalid credentials or network timeout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900 px-6`}>
      <Text style={tw`text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2`}>Credora</Text>
      <Text style={tw`text-sm text-gray-500 mb-10`}>Mobile Ecosystem</Text>
      
      <View style={tw`w-full bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700`}>
        <Text style={tw`text-gray-700 dark:text-gray-300 font-bold mb-2`}>Email Address</Text>
        <TextInput 
          style={tw`w-full border border-gray-300 dark:border-gray-600 dark:text-white rounded-xl p-4 mb-5 bg-gray-50 dark:bg-gray-700`}
          placeholder="admin@credora.com"
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
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={tw`text-white font-bold text-lg`}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
