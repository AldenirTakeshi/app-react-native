import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }

  const configUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (configUrl) {
    return configUrl;
  }

  if (Platform.OS === 'web') {
    return __DEV__
      ? 'http://localhost:3001'
      : 'https://app-react-native-production.up.railway.app';
  }

  if (__DEV__) {
    const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
    if (devHost && devHost !== 'localhost' && devHost !== '127.0.0.1') {
      return `http://${devHost}:3001`;
    }
    return 'http://192.168.2.21:3001';
  }

  return 'https://app-react-native-production.up.railway.app';
};

export const buildImageUrl = (imageUrl?: string): string | undefined => {
  if (!imageUrl) return undefined;

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};
