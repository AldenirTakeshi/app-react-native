import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível registrar';
      Alert.alert('Erro', message);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          alwaysBounceVertical={false}
          scrollEventThrottle={16}
        >
        <View style={styles.card}>
          <Text style={styles.title}>Criar conta</Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Seu email"
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Sua senha"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Criando...' : 'Criar conta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/login')}
            style={{ marginTop: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#aaa' }}>Já tem conta? Entrar</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  keyboardView: { flex: 1 },
  scroll: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 20,
    minHeight: '100%'
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 16 },
  label: { color: '#fff', marginTop: 10, marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: '#232323',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    borderColor: '#333',
    borderWidth: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#232323',
    borderRadius: 10,
    padding: 14,
    paddingRight: 50,
    color: '#fff',
    borderColor: '#333',
    borderWidth: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 14,
    padding: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: { backgroundColor: '#555' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
