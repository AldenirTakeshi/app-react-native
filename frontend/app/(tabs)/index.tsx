import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapViewSafe } from '../../components/MapViewSafe';
import MenuDropdown from '../../components/MenuDropdown';
import { apiService, Category, Event, Location } from '../../services/api';
import { buildImageUrl } from '../../utils/apiConfig';

export default function EventsListScreen() {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadCategoriesAndLocations();
    loadEvents();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadEvents();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchText]);

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
      if (response.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (event: Event) => {
    router.push(`/event/${event.id}` as any);
  };

  const handleMapPress = () => {
    router.push('/(tabs)/mapa' as any);
  };

  const handleAddEvent = () => {
    router.push('/event/new' as any);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
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

  const getCategoryName = (category: Event['category']) => {
    if (typeof category === 'string') return category;
    return category?.name || 'Sem categoria';
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return buildImageUrl(imageUrl) || imageUrl;
  };

  const getLocationData = (event: Event): Location | null => {
    if (typeof event.location === 'string') return null;
    return event.location as Location;
  };

  if (loading && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  const filteredEvents = events;
  const totalEvents = filteredEvents.length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
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
        <View style={styles.mapPreview}>
          <MapViewSafe
            style={styles.map}
            initialRegion={{
              latitude: -23.5505,
              longitude: -46.6333,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          />
          <TouchableOpacity style={styles.mapButton} onPress={handleMapPress}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.mapButtonText}>Explore pelo Mapa</Text>
          </TouchableOpacity>
        </View>

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
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.eventCard}
                onPress={() => handleEventPress(item)}
              >
                <View style={styles.imageContainer}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: getImageUrl(item.imageUrl) || undefined }}
                      style={styles.eventImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons name="image-outline" size={48} color="#999" />
                    </View>
                  )}
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
                        {item.name}
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
            )}
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
