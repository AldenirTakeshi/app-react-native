const withGoogleMapsApiKey = require('./plugins/withGoogleMapsApiKey');

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyA0GUwQMl9X3KuBEklAe238hciv3JcCvT8';

module.exports = {
  expo: {
    name: 'meuAppReactNative',
    slug: 'meuAppReactNative',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'meuappreactnative',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.aldenirtakeshi.meuAppReactNative',
      config: {
        googleMaps: {
          apiKey: GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      [
        'react-native-maps',
        {
          googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        },
      ],
      [withGoogleMapsApiKey, { apiKey: GOOGLE_MAPS_API_KEY }],
    ],
    experiments: {
      typedRoutes: true,
    },
    jsEngine: 'hermes',
    extra: {
      router: {},
      eas: {
        projectId: 'cdf589fe-445c-4afc-acde-ed1292bf5ad3',
      },
      apiBaseUrl: 'https://app-react-native-production.up.railway.app',
    },
  },
};
