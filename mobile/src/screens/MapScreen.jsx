import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { CAMPUS_CENTER } from "@/constants/config";
import { BRAND_BLUE } from "@/constants/colors";
import { CampusSearchBar } from "@/components/CampusSearchBar";
import { StaffDetailSheet } from "@/components/StaffDetailSheet";
import { useRouteTracking } from "@/hooks/useRouteTracking";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  computeWalkRoute,
  routeDistanceMeters
} from "@/lib/outdoorRouting";
function CampusMapScreen() {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const [scope, setScope] = useState("all");
  const [destination, setDestination] = useState(null);
  const [fullRoute, setFullRoute] = useState(null);
  const [routing, setRouting] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [staffMember, setStaffMember] = useState(null);
  const [staffCollapsed, setStaffCollapsed] = useState(false);
  const { coords: userCoords } = useUserLocation();
  const { displayRoute, remainingMeters, arrived } = useRouteTracking(fullRoute, userCoords);
  const flyTo = useCallback((lng, lat) => {
    const region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 4e-3,
      longitudeDelta: 4e-3
    };
    mapRef.current?.animateToRegion(region, 500);
  }, []);
  const clearRoute = useCallback(() => {
    setFullRoute(null);
    setDestination(null);
    setRouteError(null);
    setStaffMember(null);
    setStaffCollapsed(false);
  }, []);
  const routeToDestination = useCallback(async (result) => {
    if (!result.coordinates) {
      setRouteError("No map coordinates for this location.");
      return;
    }
    const [endLng, endLat] = result.coordinates;
    setRouting(true);
    setRouteError(null);
    try {
      if (!userCoords) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setRouteError("Location permission is required for walking directions.");
          return;
        }
      }
      const current = userCoords ?? (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      })).coords;
      const route = await computeWalkRoute(
        current.longitude,
        current.latitude,
        endLng,
        endLat
      );
      if (!route?.length) {
        setRouteError("No walkway route found. Try a destination closer to campus paths.");
        setFullRoute(null);
        return;
      }
      setFullRoute(route);
      flyTo(endLng, endLat);
    } catch {
      setRouteError("Could not calculate route.");
      setFullRoute(null);
    } finally {
      setRouting(false);
    }
  }, [flyTo, userCoords]);
  const handleSelect = useCallback(async (result) => {
    if (result.type === "indoor" && result.indoorId) {
      navigation.navigate("Indoor", { locationId: result.indoorId });
      return;
    }
    setDestination(result);
    if (result.type === "staff") {
      setStaffMember(result);
      setStaffCollapsed(false);
    } else {
      setStaffMember(null);
      setStaffCollapsed(false);
    }
    if (!result.coordinates) {
      Alert.alert("No coordinates", "This result has no outdoor map location.");
      return;
    }
    const [lng, lat] = result.coordinates;
    flyTo(lng, lat);
    if (result.type === "staff") {
      return;
    }
    await routeToDestination(result);
  }, [flyTo, navigation, routeToDestination]);
  const handleMapPress = useCallback(() => {
    if (staffMember && !staffCollapsed) {
      setStaffCollapsed(true);
    }
  }, [staffMember, staffCollapsed]);
  const routeToStaff = useCallback(async () => {
    if (!staffMember) return;
    setStaffCollapsed(false);
    await routeToDestination(staffMember);
  }, [routeToDestination, staffMember]);
  const useMyLocation = useCallback(async () => {
    if (userCoords) {
      flyTo(userCoords.longitude, userCoords.latitude);
      return;
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Allow location access to use GPS.");
        return;
      }
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      flyTo(current.coords.longitude, current.coords.latitude);
    } catch {
      Alert.alert("GPS error", "Could not get your current location.");
    }
  }, [flyTo, userCoords]);
  const totalMeters = fullRoute ? routeDistanceMeters(fullRoute) : null;
  const showMeters = remainingMeters ?? totalMeters;
  const minutes = showMeters != null ? Math.max(1, Math.round(showMeters / 1.4 / 60)) : null;
  const bottomInset = staffMember ? (staffCollapsed ? 72 : 280) : 0;
  return <View style={styles.container}>
      <MapView
    ref={mapRef}
    style={styles.map}
    provider={PROVIDER_DEFAULT}
    initialRegion={CAMPUS_CENTER}
    showsUserLocation
    showsMyLocationButton
    onPress={handleMapPress}
  >
        {destination?.coordinates && <Marker
    coordinate={{
      latitude: destination.coordinates[1],
      longitude: destination.coordinates[0]
    }}
    title={destination.type === "staff" && destination.roomNo ? `${destination.name} (Room ${destination.roomNo})` : destination.name}
    pinColor="#dc2626"
    onPress={() => {
      if (destination.type === "staff") {
        setStaffCollapsed(false);
      }
    }}
  />}

        {displayRoute && displayRoute.length > 1 && <Polyline coordinates={displayRoute} strokeColor={BRAND_BLUE} strokeWidth={5} />}
      </MapView>

      <View style={styles.searchOverlay}>
        <CampusSearchBar scope={scope} onScopeChange={setScope} onSelect={handleSelect} />
      </View>

      <View style={[styles.actionsRow, { bottom: 24 + bottomInset }]}>
        <Pressable style={styles.actionBtn} onPress={useMyLocation}>
          <Text style={styles.actionBtnText}>My location</Text>
        </Pressable>
        {fullRoute && <Pressable style={[styles.actionBtn, styles.clearBtn]} onPress={clearRoute}>
            <Text style={styles.clearBtnText}>Clear route</Text>
          </Pressable>}
      </View>

      {(routing || routeError || showMeters != null) && <View style={[styles.routeCard, { bottom: 80 + bottomInset }]}>
          {routing && <ActivityIndicator color={BRAND_BLUE} />}
          {routeError && <Text style={styles.routeError}>{routeError}</Text>}
          {!routing && !routeError && showMeters != null && <>
              <Text style={styles.routeTitle}>
                {arrived ? "You have arrived" : "Walking route"}
              </Text>
              {!arrived && <Text style={styles.routeMeta}>
                  {showMeters < 1e3 ? `${Math.round(showMeters)} m remaining` : `${(showMeters / 1e3).toFixed(2)} km remaining`}
                  {minutes != null ? ` \xB7 ~${minutes} min` : ""}
                </Text>}
            </>}
        </View>}

      {staffMember && <StaffDetailSheet
    staff={staffMember}
    collapsed={staffCollapsed}
    onToggle={() => setStaffCollapsed((prev) => !prev)}
    onClose={() => {
      setStaffMember(null);
      setStaffCollapsed(false);
    }}
    onDirections={routeToStaff}
  />}
    </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchOverlay: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16
  },
  actionsRow: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 8
  },
  actionBtn: {
    backgroundColor: BRAND_BLUE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },
  actionBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  clearBtn: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  clearBtnText: { color: "#374151", fontWeight: "600", fontSize: 14 },
  routeCard: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  routeTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  routeMeta: { fontSize: 13, color: "#4b5563", marginTop: 4 },
  routeError: { fontSize: 13, color: "#dc2626" }
});
export {
  CampusMapScreen
};
