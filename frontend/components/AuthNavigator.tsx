import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { router, useSegments, usePathname } from 'expo-router';

export default function AuthNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!initialCheckDone) {
      setInitialCheckDone(true);
    }

    if (!segments || !segments[0]) {
      if (!isAuthenticated) {
        setTimeout(() => {
          try {
            router.replace('/login');
          } catch (error) {
            console.error('Erro ao navegar para login:', error);
          }
        }, 100);
      }
      return;
    }

    try {
      const firstSegment = String(segments[0]);
      const pathnameStr = String(pathname);

      const inAuthGroup =
        firstSegment === '(tabs)' ||
        pathnameStr.includes('/event') ||
        pathnameStr.includes('/categorias') ||
        pathnameStr.includes('/locais');

      const inLoginRoute =
        firstSegment === 'login' || firstSegment === 'register';

      if (isAuthenticated) {
        if (inLoginRoute) {
          setTimeout(() => {
            try {
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Erro ao navegar para tabs:', error);
            }
          }, 100);
        }
      } else {
        if (inAuthGroup || pathnameStr === '/' || pathnameStr === '') {
          setTimeout(() => {
            try {
              router.replace('/login');
            } catch (error) {
              console.error('Erro ao navegar para login:', error);
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Erro no AuthNavigator:', error);
    }
  }, [isAuthenticated, isLoading, segments, pathname, initialCheckDone]);

  if (isLoading || !initialCheckDone) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
