import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function AboutScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>

        <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
        <Text style={styles.userEmail}>
          {user?.email || 'email@exemplo.com'}
        </Text>

        <Text style={styles.memberSince}>
          Membro desde:{' '}
          {user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString('pt-BR')
            : 'N/A'}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.title}>Sobre o App</Text>
        <Text style={styles.subtitle}>
          Gerencie eventos de forma simples e eficiente.
        </Text>
        <Text style={styles.version}>Versão 1.0.0</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/categorias' as any)}
        >
          <Ionicons name="pricetag-outline" size={24} color="#007AFF" />
          <Text style={styles.menuItemText}>Gerenciar Categorias</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/locais' as any)}
        >
          <Ionicons name="location-outline" size={24} color="#FF9800" />
          <Text style={styles.menuItemText}>Gerenciar Locais</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  version: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    width: '100%',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
