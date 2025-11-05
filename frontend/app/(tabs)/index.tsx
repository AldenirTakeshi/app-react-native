import { Ionicons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapViewSafe } from '../../components/MapViewSafe';
import MenuDropdown from '../../components/MenuDropdown';
import ErrorBoundary from '../../components/ErrorBoundary';
import { apiService, Category, Event, Location } from '../../services/api';
import { buildImageUrl } from '../../utils/apiConfig';
import { useAuth } from '../../contexts/AuthContext';

function EventsListScreenContent() {
  const { user, isLoading: authLoading } = useAuth();
  let insets;
  try {
    insets = useSafeAreaInsets();
  } catch (error) {
    console.error('Erro ao obter SafeAreaInsets:', error);
    insets = { top: 0, bottom: 0, left: 0, right: 0 };
  }
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user || authLoading) {
      return;
    }

    const init = async () => {
      try {
        await Promise.allSettled([
          loadCategoriesAndLocations(),
          loadEvents(),
          getUserLocation(),
        ]);
      } catch (error) {
        console.error('Erro ao inicializar tela:', error);
      }
    };
    init();
  }, [user, authLoading]);

  const getUserLocation = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const currentLocation = await ExpoLocation.getCurrentPositionAsync({});
      setUserLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    }
  };

  useEffect(() => {
    if (!user || authLoading) {
      return;
    }

    const delayDebounce = setTimeout(() => {
      loadEvents();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchText, user, authLoading]);

  const loadCategoriesAndLocations = async () => {
    try {
      const [categoriesRes, locationsRes] = await Promise.all([
        apiService.getCategories(),
        apiService.getLocations(),
      ]);
      if (categoriesRes.success) {
        setCategories(categoriesRes.data.categories);
      }
      if (locationsRes.success) {
        setLocations(locationsRes.data.locations);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias e locais:', error);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEvents(searchText || undefined);
      if (response.success && response.data?.events) {
        const validEvents = response.data.events.filter(
          (event: Event) => event && event.id && event.name,
        );
        setEvents(validEvents);
      } else {
        setEvents([]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar eventos:', error);

      if (
        error?.message?.includes('auth') ||
        error?.message?.includes('token')
      ) {
        console.warn('Erro de autenticação ao carregar eventos');
      } else if (!searchText) {
        Alert.alert(
          'Aviso',
          'Não foi possível carregar os eventos. Verifique sua conexão.',
          [{ text: 'OK' }],
        );
      }

      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadEvents(),
      loadCategoriesAndLocations(),
      getUserLocation(),
    ]);
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    try {
      if (!event || !event.id) {
        console.warn('Evento inválido ao tentar navegar');
        return;
      }
      router.push(`/event/${event.id}` as any);
    } catch (error) {
      console.error('Erro ao navegar para detalhes do evento:', error);
    }
  };

  const handleMapPress = () => {
    router.push('/(tabs)/mapa' as any);
  };

  const handleAddEvent = () => {
    router.push('/event/new' as any);
  };

  const formatPrice = (price: number | undefined | null) => {
    try {
      if (price === undefined || price === null || isNaN(price)) {
        return 'R$ 0,00';
      }
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
      }).format(price);
    } catch (error) {
      console.error('Erro ao formatar preço:', error);
      return 'R$ 0,00';
    }
  };

  const formatDate = (dateString: string | undefined | null) => {
    try {
      if (!dateString) return 'Data não informada';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const getCategoryName = (category: Event['category']) => {
    if (typeof category === 'string') return category;
    return category?.name || 'Sem categoria';
  };

  const getImageUrl = (imageUrl?: string): string | null => {
    try {
      if (!imageUrl) return null;
      if (imageUrl.startsWith('http')) return imageUrl;
      const builtUrl = buildImageUrl(imageUrl);
      return builtUrl || imageUrl || null;
    } catch (error) {
      console.error('Erro ao construir URL da imagem:', error);
      return imageUrl || null;
    }
  };

  const getLocationData = (event: Event): Location | null => {
    try {
      if (!event.location) return null;
      if (typeof event.location === 'string') return null;
      return event.location as Location;
    } catch (error) {
      console.error('Erro ao obter dados de localização:', error);
      return null;
    }
  };

  if ((authLoading || loading) && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>
          {authLoading
            ? 'Verificando autenticação...'
            : 'Carregando eventos...'}
        </Text>
      </View>
    );
  }

  const filteredEvents = Array.isArray(events) ? events : [];
  const totalEvents = filteredEvents.length;

  try {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: (insets?.top || 0) + 8 }]}>
          <Text style={styles.logoText}>Logo</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="menu" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.welcomeText}>Bem vindo ao Aplicativo</Text>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquise Eventos, Show e etc.."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <Text style={styles.exploreTitle}>Explore os Eventos</Text>
          <TouchableOpacity
            style={styles.mapPreview}
            activeOpacity={0.8}
            onPress={handleMapPress}
          >
            {(() => {
              try {
                const defaultRegion = {
                  latitude: -23.5505,
                  longitude: -46.6333,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                };

                const region =
                  userLocation &&
                  typeof userLocation.latitude === 'number' &&
                  typeof userLocation.longitude === 'number' &&
                  !isNaN(userLocation.latitude) &&
                  !isNaN(userLocation.longitude) &&
                  userLocation.latitude >= -90 &&
                  userLocation.latitude <= 90 &&
                  userLocation.longitude >= -180 &&
                  userLocation.longitude <= 180
                    ? {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                      }
                    : defaultRegion;

                return (
                  <MapViewSafe
                    style={styles.map}
                    initialRegion={region}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                    showsUserLocation={!!userLocation}
                    onError={(error) => {
                      console.error('Erro no MapView:', error);
                    }}
                  />
                );
              } catch (error) {
                console.error('Erro ao renderizar mapa:', error);
                return (
                  <View style={styles.map}>
                    <View style={styles.mapPlaceholder}>
                      <Ionicons name="map-outline" size={48} color="#999" />
                      <Text style={styles.mapPlaceholderText}>
                        Mapa temporariamente indisponível
                      </Text>
                      <Text style={styles.mapPlaceholderSubtext}>
                        Recompile: npm run android
                      </Text>
                    </View>
                  </View>
                );
              }
            })()}
            <TouchableOpacity style={styles.mapButton} onPress={handleMapPress}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.mapButtonText}>Explore pelo Mapa</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {filteredEvents.length > 0 && (
            <Text style={styles.eventsCount}>
              Mostrando {filteredEvents.length} de {totalEvents} Eventos
            </Text>
          )}

          {filteredEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum evento</Text>
              <Text style={styles.emptyText}>Localizado</Text>
            </View>
          ) : (
            <FlatList
              data={filteredEvents}
              keyExtractor={(item) => item?.id || Math.random().toString()}
              scrollEnabled={false}
              renderItem={({ item }) => {
                if (!item) return null;
                return (
                  <TouchableOpacity
                    style={styles.eventCard}
                    onPress={() => handleEventPress(item)}
                  >
                    <View style={styles.imageContainer}>
                      {(() => {
                        try {
                          const imageUrl = getImageUrl(item.imageUrl);
                          if (imageUrl) {
                            return (
                              <Image
                                source={{ uri: imageUrl }}
                                style={styles.eventImage}
                                resizeMode="cover"
                                onError={(error) => {
                                  console.error(
                                    'Erro ao carregar imagem:',
                                    error,
                                  );
                                }}
                              />
                            );
                          }
                          return (
                            <View style={styles.placeholderImage}>
                              <Ionicons
                                name="image-outline"
                                size={48}
                                color="#999"
                              />
                            </View>
                          );
                        } catch (error) {
                          console.error('Erro ao renderizar imagem:', error);
                          return (
                            <View style={styles.placeholderImage}>
                              <Ionicons
                                name="image-outline"
                                size={48}
                                color="#999"
                              />
                            </View>
                          );
                        }
                      })()}
                      <View style={styles.carouselIndicators}>
                        <View style={styles.indicator} />
                        <View style={styles.indicator} />
                        <View
                          style={[styles.indicator, styles.indicatorInactive]}
                        />
                        <View
                          style={[styles.indicator, styles.indicatorInactive]}
                        />
                      </View>
                    </View>

                    <View style={styles.eventInfo}>
                      <View style={styles.eventHeader}>
                        <View style={styles.eventTitleContainer}>
                          <Text style={styles.eventTitle} numberOfLines={2}>
                            {item.name || 'Evento sem nome'}
                          </Text>
                          <Text style={styles.eventType}>
                            {getCategoryName(item.category)}
                          </Text>
                        </View>
                        <Text style={styles.eventDate}>
                          {formatDate(item.date)}
                        </Text>
                      </View>

                      <View style={styles.eventFooter}>
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceLabel}>Ingresso</Text>
                          <Text style={styles.priceValue}>
                            {formatPrice(item.price)}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.detailsButton}
                          onPress={() => handleEventPress(item)}
                        >
                          <Text style={styles.detailsButtonText}>
                            Mais Detalhes ▸
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={handleAddEvent}>
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>

        <MenuDropdown
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
        />
      </View>
    );
  } catch (error) {
    console.error('Erro crítico ao renderizar tela de eventos:', error);
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#666', fontSize: 16, marginBottom: 8 }}>
          Erro ao carregar eventos
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#1E3A8A',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          onPress={() => {
            setEvents([]);
            setLoading(true);
            loadEvents();
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            Tentar Novamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default function EventsListScreen() {
  return (
    <ErrorBoundary>
      <EventsListScreenContent />
    </ErrorBoundary>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  menuButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  exploreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  mapPreview: {
    height: 200,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E5E5',
  },
  map: {
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  mapButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  eventsCount: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5E5',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselIndicators: {
    position: 'absolute',
    bottom: 12,
    left: '50%',
    transform: [{ translateX: -32 }],
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E3A8A',
  },
  indicatorInactive: {
    backgroundColor: '#FFFFFF',
  },
  eventInfo: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    color: '#999',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  detailsButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  detailsButtonText: {
    color: '#FFFFFF',
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
