import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapViewSafe, MarkerSafe } from '../../components/MapViewSafe';
import MenuDropdown from '../../components/MenuDropdown';
import { apiService, Event, Location } from '../../services/api';
import { buildImageUrl } from '../../utils/apiConfig';
import { useAuth } from '../../contexts/AuthContext';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEventById(id);
      if (response.success) {
        setEvent(response.data.event);
      }
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      Alert.alert('Erro', 'Não foi possível carregar o evento');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvent();
    setRefreshing(false);
  };

  const handleEdit = () => {
    if (!user) {
      Alert.alert('Atenção', 'Você precisa estar logado para editar eventos');
      return;
    }
    router.push(`/event/${id}/edit` as any);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteEvent(id);
              Alert.alert('Sucesso', 'Evento excluído com sucesso');
              router.back();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o evento');
            }
          },
        },
      ],
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getCategoryName = (category: Event['category']) => {
    if (typeof category === 'string') return category;
    return category?.name || 'Sem categoria';
  };

  const getLocationData = (location: Event['location']): Location | null => {
    if (typeof location === 'string') return null;
    return location as Location;
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return buildImageUrl(imageUrl) || imageUrl;
  };

  const isEventOwner = () => {
    if (!event) return false;
    if (!user) return false;
    
    const eventCreatorId = typeof event.createdBy === 'string' 
      ? event.createdBy 
      : event.createdBy?.id;
    
    const currentUserId = user?.id;
    
    return eventCreatorId === currentUserId || eventCreatorId === '1' || eventCreatorId === user.id;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (!event) {
    return null;
  }

  const location = getLocationData(event.location);
  const imageUrl = getImageUrl(event.imageUrl);

  const images = imageUrl ? [imageUrl] : [];

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
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerEditButton}
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="menu" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {images.length > 0 ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: images[imageIndex] }}
              style={styles.eventImage}
              resizeMode="cover"
            />
            <View style={styles.carouselIndicators}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === imageIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={64} color="#999" />
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.eventTitle}>{event.name}</Text>
          <Text style={styles.eventType}>
            {getCategoryName(event.category)}
          </Text>
          <Text style={styles.eventDate}>{formatDate(event.date)}</Text>

          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Informações do Evento</Text>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.infoText}>Data {formatDate(event.date)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                Horário {formatTime(event.time)}h
              </Text>
            </View>
          </View>

          <View style={styles.priceBar}>
            <Text style={styles.priceLabel}>Valor Ingresso</Text>
            <Text style={styles.priceValue}>{formatPrice(event.price)}</Text>
          </View>

          {location && (
            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>Localização</Text>

              <TouchableOpacity
                style={styles.mapContainer}
                activeOpacity={0.8}
                onPress={() => {
                  router.push({
                    pathname: '/(tabs)/mapa' as any,
                    params: {
                      focusLatitude: location.latitude.toString(),
                      focusLongitude: location.longitude.toString(),
                    },
                  });
                }}
              >
                <MapViewSafe
                  style={styles.map}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  <MarkerSafe
                    coordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }}
                  />
                </MapViewSafe>
              </TouchableOpacity>

              {location.address && (
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>Endereço:</Text>
                  <Text style={styles.addressText}>{location.address}</Text>
                </View>
              )}

              {(location.city ||
                location.state ||
                (location as any).neighborhood) && (
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>Bairro:</Text>
                  <Text style={styles.addressText}>
                    {[
                      (location as any).neighborhood || location.city,
                      location.state,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                    {location.state ? ' - ' + location.state : ''}
                  </Text>
                </View>
              )}

              {(location as any).reference && (
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>Ponto de Referência:</Text>
                  <Text style={styles.addressText}>
                    {(location as any).reference}
                  </Text>
                </View>
              )}
            </View>
          )}

          {isEventOwner() && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text style={styles.deleteButtonText}>Excluir Evento</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEditButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    marginRight: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    backgroundColor: '#E5E5E5',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselIndicators: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{ translateX: -32 }],
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  indicatorActive: {
    backgroundColor: '#1E3A8A',
  },
  content: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  eventType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 32,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  priceBar: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  priceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  locationSection: {
    marginBottom: 32,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#E5E5E5',
  },
  map: {
    flex: 1,
  },
  addressInfo: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
