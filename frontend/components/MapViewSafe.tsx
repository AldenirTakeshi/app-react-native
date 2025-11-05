import { Platform, View, Text, StyleSheet } from 'react-native';
import React from 'react';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;
let mapsLoadAttempted = false;
let mapsLoadError: any = null;

const loadMapsModule = () => {
  if (Platform.OS === 'web') {
    return { MapView: null, Marker: null, PROVIDER_GOOGLE: null };
  }

  if (MapView && Marker) {
    return { MapView, Marker, PROVIDER_GOOGLE };
  }

  if (mapsLoadAttempted && mapsLoadError) {
    console.warn(
      'react-native-maps falhou ao carregar anteriormente:',
      mapsLoadError,
    );
    return { MapView: null, Marker: null, PROVIDER_GOOGLE: null };
  }

  try {
    mapsLoadAttempted = true;
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
    return { MapView, Marker, PROVIDER_GOOGLE };
  } catch (error) {
    console.error('Erro ao carregar react-native-maps:', error);
    mapsLoadError = error;
    return { MapView: null, Marker: null, PROVIDER_GOOGLE: null };
  }
};

interface MapViewSafeProps {
  style?: any;
  initialRegion?: any;
  region?: any;
  onRegionChangeComplete?: (region: any) => void;
  onPress?: (event: any) => void;
  onMapReady?: () => void;
  onError?: (error: any) => void;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  loadingEnabled?: boolean;
  mapType?: 'standard' | 'satellite' | 'hybrid' | 'terrain' | 'none';
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  pitchEnabled?: boolean;
  rotateEnabled?: boolean;
  children?: React.ReactNode;
}

interface MarkerSafeProps {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  description?: string;
  draggable?: boolean;
  onPress?: () => void;
  onDragEnd?: (event: any) => void;
}

export function MapViewSafe({ children, ...props }: MapViewSafeProps) {
  const { MapView: MapViewComponent, PROVIDER_GOOGLE: ProviderGoogle } =
    loadMapsModule();

  if (Platform.OS === 'web' || !MapViewComponent) {
    const message =
      Platform.OS === 'web'
        ? 'Mapas não estão disponíveis na web'
        : 'Mapas temporariamente indisponíveis';
    const submessage =
      Platform.OS === 'web'
        ? 'Use o app mobile para visualizar mapas'
        : 'Verifique se react-native-maps está configurado';

    return (
      <View style={[styles.container, props.style]}>
        <View style={styles.webPlaceholder}>
          <Text style={styles.webPlaceholderText}>🗺️ {message}</Text>
          <Text style={styles.webPlaceholderSubtext}>{submessage}</Text>
        </View>
      </View>
    );
  }

  try {
    const useGoogleMaps = Platform.OS === 'android' && ProviderGoogle;

    const mapProps = useGoogleMaps
      ? { ...props, provider: ProviderGoogle }
      : props;

    return (
      <MapViewComponent
        {...mapProps}
        onError={(error: any) => {
          console.error('Erro no MapView:', error);
          if (props.onError) {
            props.onError(error);
          }
        }}
      >
        {children}
      </MapViewComponent>
    );
  } catch (error) {
    console.error('Erro ao renderizar MapView:', error);
    return (
      <View style={[styles.container, props.style]}>
        <View style={styles.webPlaceholder}>
          <Text style={styles.webPlaceholderText}>Erro ao carregar mapa</Text>
          <Text style={styles.webPlaceholderSubtext}>
            Configure a Google Maps API Key
          </Text>
        </View>
      </View>
    );
  }
}

export function MarkerSafe(props: MarkerSafeProps) {
  const { Marker: MarkerComponent } = loadMapsModule();

  if (Platform.OS === 'web' || !MarkerComponent) {
    return null;
  }

  return <MarkerComponent {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  webPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  webPlaceholderSubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
});
