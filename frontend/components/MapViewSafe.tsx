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

const loadMapsModule = () => {
  if (Platform.OS === 'web') {
    return { MapView: null, Marker: null };
  }

  if (MapView && Marker) {
    return { MapView, Marker };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    return { MapView, Marker };
  } catch (error) {
    return { MapView: null, Marker: null };
  }
};

interface MapViewSafeProps {
  style?: any;
  initialRegion?: any;
  region?: any;
  onRegionChangeComplete?: (region: any) => void;
  onPress?: (event: any) => void;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
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
  const { MapView: MapViewComponent } = loadMapsModule();

  if (Platform.OS === 'web' || !MapViewComponent) {
    return (
      <View style={[styles.container, props.style]}>
        <View style={styles.webPlaceholder}>
          <Text style={styles.webPlaceholderText}>
            🗺️ Mapas não estão disponíveis na web
          </Text>
          <Text style={styles.webPlaceholderSubtext}>
            Use o app mobile para visualizar mapas
          </Text>
        </View>
      </View>
    );
  }

  return <MapViewComponent {...props}>{children}</MapViewComponent>;
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
