import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Application Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LoanApplicationScreen from './src/screens/LoanApplicationScreen';
import DocumentUploadScreen from './src/screens/DocumentUploadScreen';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Public Auth Stack
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        // Protected Stack
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="LoanApplication" component={LoanApplicationScreen} />
          <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
