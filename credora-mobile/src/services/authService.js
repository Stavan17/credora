import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (credentials) => {
    // Send as form data (OAuth2 format)
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post('/api/auth/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    if (response.data.access_token) {
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },
};
