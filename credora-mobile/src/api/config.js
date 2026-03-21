import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Since mobile simulators cannot resolve 'localhost', we bridge directly to the host IP.
// Based on exact terminal traces, your primary network adapter IP is injected below.
export const API_BASE_URL = 'http://192.168.29.179:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
