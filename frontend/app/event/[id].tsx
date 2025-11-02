import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiService, Event, Location } from '../../services/api';
import { buildImageUrl } from '../../utils/apiConfig';
import { useAuth } from '../../contexts/AuthContext';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleEdit = () => {
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
    }).format(price);
  };

  const formatDateTime = (dateString: string, time: string) => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    return `${dateFormatted} às ${time}`;
  };

  const getCategoryName = (category: Event['category']) => {
    if (typeof category === 'string') return category;
    return category.name;
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
    if (!event || !user) return false;
    return event.createdBy.id === user.id || event.createdBy.id === '1';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!event) {
    return null;
  }

  const location = getLocationData(event.location);

  return (
    <ScrollView style={styles.container}>
      {event.imageUrl && (
        <Image
          source={{ uri: getImageUrl(event.imageUrl) || undefined }}
          style={styles.headerImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.name}</Text>
          {isEventOwner() && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
              >
                <Ionicons name="create-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={24} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Data e Hora</Text>
              <Text style={styles.infoValue}>
                {formatDateTime(event.date, event.time)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={24} color="#4CAF50" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Preço</Text>
              <Text style={styles.infoValue}>{formatPrice(event.price)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={24} color="#FF9800" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Categoria</Text>
              <Text style={styles.infoValue}>
                {getCategoryName(event.category)}
              </Text>
            </View>
          </View>

          {location && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={24} color="#FF5722" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Local</Text>
                <Text style={styles.infoValue}>{location.name}</Text>
                {location.address && (
                  <Text style={styles.infoSubtext}>{location.address}</Text>
                )}
                {(location.city || location.state) && (
                  <Text style={styles.infoSubtext}>
                    {[location.city, location.state, location.country]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {event.createdBy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizado por</Text>
            <Text style={styles.organizer}>
              {event.createdBy.name || event.createdBy.email}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
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
  headerImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#333',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 2,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  organizer: {
    fontSize: 16,
    color: '#aaa',
  },
});
