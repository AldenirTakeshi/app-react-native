import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { router, useSegments } from 'expo-router';

export default function AuthNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inLoginRoute = segments[0] === 'login' || segments[0] === 'register';

    if (isAuthenticated) {
      if (inLoginRoute) {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      }
    } else {
      if (inAuthGroup) {
        setTimeout(() => {
          router.replace('/login');
        }, 100);
      }
    }
  }, [isAuthenticated, isLoading, segments]);
  return null;
}
