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
      const message =
        error instanceof Error ? error.message : 'Não foi possível registrar';
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
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>Logo</Text>
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#333"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome"
                    placeholderTextColor="#666"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#333"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="E-mail"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#333"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Senha"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
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
            </View>

            <View style={styles.loginContainer}>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.loginText}>Já tem conta? Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    marginBottom: 60,
    alignItems: 'center',
    width: '100%',
  },
  logoPlaceholder: {
    width: 200,
    height: 120,
    backgroundColor: '#E5E5E5',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#666666',
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 0,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 0,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 0,
    paddingRight: 8,
  },
  eyeButton: {
    padding: 4,
  },
  button: {
    backgroundColor: '#1E3A8A',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#666666',
    fontSize: 14,
  },
});
