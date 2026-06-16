import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { fetchGeoJson } from '@/api/client';
import { CAMPUS_CENTER } from '@/constants/config';
import { CampusSearchBar } from '@/components/CampusSearchBar';
import type { SearchResult, SearchScope } from '@/types';

export function CampusMapScreen() {
  const mapRef = useRef<MapView>(null);
  const [scope, setScope] = useState<SearchScope>('all');
  const [markers, setMarkers] = useState<Array<{ id: string; title: string; latitude: number; longitude: number }>>([]);
  const [routeLine, setRouteLine] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [destination, setDestination] = useState<SearchResult | null>(null);

  useEffect(() => {
    fetchGeoJson('nust-buildings')
      .then((geojson) => {
        const next = (geojson.features ?? [])
          .map((feature, index) => {
            const coords = feature.geometry?.type === 'Point' ? feature.geometry.coordinates : null;
            if (!coords) return null;
            return {
              id: String(feature.properties?.id ?? index),
              title: String(feature.properties?.name ?? 'Building'),
              longitude: coords[0],
              latitude: coords[1],
            };
          })
          .filter(Boolean) as Array<{ id: string; title: string; latitude: number; longitude: number }>;
        setMarkers(next);
      })
      .catch(() => undefined);
  }, []);

  const handleSelect = async (result: SearchResult) => {
    setDestination(result);
    if (!result.coordinates) return;

    const [lng, lat] = result.coordinates;
    const region: Region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    };
    mapRef.current?.animateToRegion(region, 500);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setRouteLine([{ latitude: lat, longitude: lng }]);
        return;
      }
      const current = await Location.getCurrentPositionAsync({});
      setRouteLine([
        { latitude: current.coords.latitude, longitude: current.coords.longitude },
        { latitude: lat, longitude: lng },
      ]);
    } catch {
      setRouteLine([{ latitude: lat, longitude: lng }]);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={CAMPUS_CENTER}
        showsUserLocation
        showsMyLocationButton
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
          />
        ))}
        {destination?.coordinates && (
          <Marker
            coordinate={{
              latitude: destination.coordinates[1],
              longitude: destination.coordinates[0],
            }}
            title={destination.name}
            pinColor="#dc2626"
          />
        )}
        {routeLine.length > 1 && <Polyline coordinates={routeLine} strokeColor="#2563eb" strokeWidth={4} />}
      </MapView>

      <View style={styles.searchOverlay}>
        <CampusSearchBar scope={scope} onScopeChange={setScope} onSelect={handleSelect} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchOverlay: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
  },
});
