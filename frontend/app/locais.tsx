import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiService, Location } from '../services/api';

export default function LocationsScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLocations();
      if (response.success) {
        setLocations(response.data.locations);
      }
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
      Alert.alert('Erro', 'Não foi possível carregar os locais');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLocation(null);
    setName('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setModalVisible(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setName(location.name);
    setAddress(location.address || '');
    setLatitude(location.latitude.toString());
    setLongitude(location.longitude.toString());
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !latitude || !longitude) {
      Alert.alert('Atenção', 'Preencha nome, latitude e longitude');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Atenção', 'Latitude e longitude devem ser números válidos');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Atenção', 'Valores de coordenadas inválidos');
      return;
    }

    try {
      if (editingLocation) {
        await apiService.updateLocation(editingLocation.id, {
          name,
          address: address || undefined,
          latitude: lat,
          longitude: lng,
        });
        Alert.alert('Sucesso', 'Local atualizado com sucesso');
      } else {
        await apiService.createLocation({
          name,
          address: address || undefined,
          latitude: lat,
          longitude: lng,
        });
        Alert.alert('Sucesso', 'Local criado com sucesso');
      }
      setModalVisible(false);
      resetForm();
      loadLocations();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar o local');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este local?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteLocation(id);
              Alert.alert('Sucesso', 'Local excluído com sucesso');
              loadLocations();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível excluir');
            }
          },
        },
      ],
    );
  };

  const resetForm = () => {
    setEditingLocation(null);
    setName('');
    setAddress('');
    setLatitude('');
    setLongitude('');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Locais</Text>
        <TouchableOpacity onPress={handleCreate}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.locationItem}>
            <Ionicons name="location" size={24} color="#FF9800" />
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{item.name}</Text>
              {item.address && (
                <Text style={styles.locationAddress}>{item.address}</Text>
              )}
              <Text style={styles.locationCoords}>
                {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(item)}
              >
                <Ionicons name="create-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>Nenhum local cadastrado</Text>
            <Text style={styles.emptySubtext}>
              Crie um local para começar
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingLocation ? 'Editar Local' : 'Novo Local'}
              </Text>
              
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nome do local"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Endereço</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Endereço (opcional)"
                placeholderTextColor="#666"
                value={address}
                onChangeText={setAddress}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Latitude *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="-23.5505"
                    placeholderTextColor="#666"
                    value={latitude}
                    onChangeText={setLatitude}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Longitude *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="-46.6333"
                    placeholderTextColor="#666"
                    value={longitude}
                    onChangeText={setLongitude}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2A2A2A',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

