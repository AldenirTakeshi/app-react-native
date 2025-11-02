import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiService, Category, Event, Location } from '../../services/api';
import { buildImageUrl } from '../../utils/apiConfig';

export default function EventsListScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    loadCategoriesAndLocations();
    loadEvents();
  }, []);

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
      const response = await apiService.getEvents(
        searchText || undefined,
        selectedCategory || undefined,
        selectedLocation || undefined,
        minPrice ? parseFloat(minPrice) : undefined,
        maxPrice ? parseFloat(maxPrice) : undefined,
        startDate || undefined,
        endDate || undefined,
      );
      if (response.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handleSearch = () => {
    loadEvents();
  };

  const handleApplyFilters = () => {
    loadEvents();
    setFiltersVisible(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedLocation('');
    setMinPrice('');
    setMaxPrice('');
    setStartDate('');
    setEndDate('');
    loadEvents();
    setFiltersVisible(false);
  };

  const hasActiveFilters = () => {
    return !!(
      selectedCategory ||
      selectedLocation ||
      minPrice ||
      maxPrice ||
      startDate ||
      endDate
    );
  };

  const handleEventPress = (event: Event) => {
    router.push(`/event/${event.id}` as any);
  };

  const handleAddEvent = () => {
    router.push('/event/new' as any);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
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
    return category.name;
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return buildImageUrl(imageUrl) || imageUrl;
  };

  if (loading && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar eventos..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            hasActiveFilters() && styles.filterButtonActive,
          ]}
          onPress={() => setFiltersVisible(true)}
        >
          <Ionicons
            name="filter"
            size={20}
            color={hasActiveFilters() ? '#007AFF' : '#fff'}
          />
          {hasActiveFilters() && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() => handleEventPress(item)}
          >
            {item.imageUrl && (
              <Image
                source={{ uri: getImageUrl(item.imageUrl) || undefined }}
                style={styles.eventImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.eventContent}>
              <Text style={styles.eventName}>{item.name}</Text>
              <View style={styles.eventInfo}>
                <View style={styles.eventInfoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#007AFF" />
                  <Text style={styles.eventInfoText}>
                    {formatDate(item.date)} às {item.time}
                  </Text>
                </View>
                <View style={styles.eventInfoRow}>
                  <Ionicons name="cash-outline" size={16} color="#4CAF50" />
                  <Text style={styles.eventInfoText}>
                    {formatPrice(item.price)}
                  </Text>
                </View>
                <View style={styles.eventInfoRow}>
                  <Ionicons name="pricetag-outline" size={16} color="#FF9800" />
                  <Text style={styles.eventInfoText}>
                    {getCategoryName(item.category)}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>Nenhum evento encontrado</Text>
            <Text style={styles.emptySubtext}>
              {searchText
                ? 'Tente uma busca diferente'
                : 'Crie um novo evento para começar'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddEvent}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modal de Filtros */}
      <Modal
        visible={filtersVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFiltersVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setFiltersVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Filtro por Categoria */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Categoria</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCategory}
                    onValueChange={setSelectedCategory}
                    style={styles.picker}
                    dropdownIconColor="#fff"
                  >
                    <Picker.Item label="Todas" value="" color="#fff" />
                    {categories.map((cat) => (
                      <Picker.Item
                        key={cat.id}
                        label={cat.name}
                        value={cat.id}
                        color="#fff"
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Filtro por Localização */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Localização</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedLocation}
                    onValueChange={setSelectedLocation}
                    style={styles.picker}
                    dropdownIconColor="#fff"
                  >
                    <Picker.Item label="Todos" value="" color="#fff" />
                    {locations.map((loc) => (
                      <Picker.Item
                        key={loc.id}
                        label={loc.name}
                        value={loc.id}
                        color="#fff"
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Filtro por Preço */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Preço</Text>
                <View style={styles.priceRow}>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceLabel}>Mínimo</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="R$ 0,00"
                      placeholderTextColor="#666"
                      value={minPrice}
                      onChangeText={setMinPrice}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceLabel}>Máximo</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="R$ 999,99"
                      placeholderTextColor="#666"
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Filtro por Data */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Data</Text>
                <View style={styles.dateRow}>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>De</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#666"
                      value={startDate}
                      onChangeText={setStartDate}
                    />
                  </View>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>Até</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#666"
                      value={endDate}
                      onChangeText={setEndDate}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearButtonText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#1A3A5F',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
  },
  eventContent: {
    padding: 16,
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  eventInfo: {
    gap: 8,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventInfoText: {
    fontSize: 14,
    color: '#aaa',
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
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  // Modal de Filtros
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 12,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    backgroundColor: '#2A2A2A',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  priceInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
