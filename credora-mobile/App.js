import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { ActivityIndicator, View } from 'react-native';

// Application Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LoanApplicationScreen from './src/screens/LoanApplicationScreen';
import DocumentUploadScreen from './src/screens/DocumentUploadScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ApplicationResultScreen from './src/screens/ApplicationResultScreen';
import AdminReviewDetailScreen from './src/screens/AdminReviewDetailScreen';
import AdminAnalyticsScreen from './src/screens/AdminAnalyticsScreen';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Public Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // Protected Stack
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="LoanApplication" component={LoanApplicationScreen} />
          <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
          <Stack.Screen name="ApplicationResult" component={ApplicationResultScreen} />
          <Stack.Screen name="AdminReviewDetail" component={AdminReviewDetailScreen} />
          <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}
