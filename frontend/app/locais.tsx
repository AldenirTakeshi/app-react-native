import { Ionicons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapViewSafe, MarkerSafe, Region } from '../components/MapViewSafe';
import MenuDropdown from '../components/MenuDropdown';
import { apiService, Location as LocationType } from '../services/api';

export default function LocationsScreen() {
  const insets = useSafeAreaInsets();
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationType | null>(
    null,
  );
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [mapLoading, setMapLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocations();
    setRefreshing(false);
  };

  const handleCreate = () => {
    setEditingLocation(null);
    setName('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setModalVisible(true);
  };

  const handleEdit = (location: LocationType) => {
    setEditingLocation(location);
    setName(location.name);
    setAddress(location.address || '');
    setLatitude(location.latitude.toString());
    setLongitude(location.longitude.toString());

    setMapRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });

    setModalVisible(true);
  };

  const handleGetCurrentLocation = async () => {
    try {
      setMapLoading(true);

      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'É necessário permitir o acesso à localização para usar esta função',
        );
        setMapLoading(false);
        return;
      }

      const currentLocation = await ExpoLocation.getCurrentPositionAsync({});
      const lat = currentLocation.coords.latitude;
      const lng = currentLocation.coords.longitude;

      setLatitude(lat.toString());
      setLongitude(lng.toString());
      setMapRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      Alert.alert('Sucesso', 'Localização atual obtida!');
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização atual');
    } finally {
      setMapLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLatitude(latitude.toString());
    setLongitude(longitude.toString());
  };

  const updateMapRegionFromCoordinates = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      setMapRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
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
    setMapRegion({
      latitude: -23.5505,
      longitude: -46.6333,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const getMarkerCoordinate = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
    return null;
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
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.logoText}>Logo</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
            <Text style={styles.emptySubtext}>Crie um local para começar</Text>
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

              <View style={styles.mapSection}>
                <View style={styles.mapHeader}>
                  <Text style={styles.label}>Selecionar no Mapa *</Text>
                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={handleGetCurrentLocation}
                    disabled={mapLoading}
                  >
                    {mapLoading ? (
                      <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                      <>
                        <Ionicons name="locate" size={18} color="#007AFF" />
                        <Text style={styles.locationButtonText}>
                          Minha Localização
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.mapContainer}>
                  <MapViewSafe
                    style={styles.map}
                    region={mapRegion}
                    onRegionChangeComplete={setMapRegion}
                    onPress={handleMapPress}
                    showsUserLocation
                    showsMyLocationButton={false}
                  >
                    {getMarkerCoordinate() && (
                      <MarkerSafe
                        coordinate={getMarkerCoordinate()!}
                        draggable
                        onDragEnd={(e) => {
                          const { latitude, longitude } =
                            e.nativeEvent.coordinate;
                          setLatitude(latitude.toString());
                          setLongitude(longitude.toString());
                        }}
                      />
                    )}
                  </MapViewSafe>
                </View>
                <Text style={styles.mapHint}>
                  Toque no mapa ou arraste o marcador para selecionar a
                  localização
                </Text>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Latitude</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="-23.5505"
                    placeholderTextColor="#666"
                    value={latitude}
                    onChangeText={(text) => {
                      setLatitude(text);
                      setTimeout(updateMapRegionFromCoordinates, 500);
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Longitude</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="-46.6333"
                    placeholderTextColor="#666"
                    value={longitude}
                    onChangeText={(text) => {
                      setLongitude(text);
                      setTimeout(updateMapRegionFromCoordinates, 500);
                    }}
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

      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <MenuDropdown
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  menuButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 12,
    color: '#999',
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
    color: '#333',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    padding: 14,
    color: '#333',
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
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mapSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  map: {
    flex: 1,
  },
  mapHint: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  locationButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
