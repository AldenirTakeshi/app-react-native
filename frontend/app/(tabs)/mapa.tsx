import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { apiService, Event, Location } from '../../services/api';

export default function MapScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEvents();
      if (response.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os eventos');
    } finally {
      setLoading(false);
    }
  };

  const getLocationData = (event: Event): Location | null => {
    if (typeof event.location === 'string') return null;
    return event.location as Location;
  };

  const handleMarkerPress = (event: Event) => {
    setSelectedMarker(event);
  };

  const handleVerDetalhes = () => {
    if (selectedMarker) {
      router.push(`/event/${selectedMarker.id}` as any);
      setSelectedMarker(null);
    }
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
    });
  };

  // Calcular região inicial baseada nos eventos
  const getInitialRegion = () => {
    const validLocations = events
      .map(getLocationData)
      .filter((loc): loc is Location => loc !== null);

    if (validLocations.length === 0) {
      // Região padrão (Brasil central)
      return {
        latitude: -14.235,
        longitude: -51.9253,
        latitudeDelta: 50,
        longitudeDelta: 50,
      };
    }

    const latitudes = validLocations.map((loc) => loc.latitude);
    const longitudes = validLocations.map((loc) => loc.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latDelta = (maxLat - minLat) * 1.5 || 0.1;
    const lngDelta = (maxLng - minLng) * 1.5 || 0.1;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.1),
      longitudeDelta: Math.max(lngDelta, 0.1),
    };
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
      <MapView
        style={styles.map}
        initialRegion={getInitialRegion()}
        showsUserLocation
        showsMyLocationButton
      >
        {events.map((event) => {
          const location = getLocationData(event);
          if (!location) return null;

          return (
            <Marker
              key={event.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={event.name}
              description={`${formatDate(event.date)} - ${formatPrice(
                event.price,
              )}`}
              onPress={() => handleMarkerPress(event)}
            />
          );
        })}
      </MapView>

      {selectedMarker && (
        <View style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{selectedMarker.name}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#007AFF" />
              <Text style={styles.infoText}>
                {formatDate(selectedMarker.date)} às {selectedMarker.time}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>
                {formatPrice(selectedMarker.price)}
              </Text>
            </View>
            {typeof selectedMarker.location !== 'string' && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="#FF9800" />
                <Text style={styles.infoText}>
                  {(selectedMarker.location as Location).name}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={handleVerDetalhes}
          >
            <Text style={styles.detailButtonText}>Ver Detalhes</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  map: {
    flex: 1,
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  infoContent: {
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#aaa',
  },
  detailButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
