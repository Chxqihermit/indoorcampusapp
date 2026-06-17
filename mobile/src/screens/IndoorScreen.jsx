import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  calculateIndoorPath,
  getBuildings,
  getFloorLocations,
  getFloors
} from "@/api/campus";
import { BRAND_BLUE } from "@/constants/colors";
function IndoorScreen() {
  const route = useRoute();
  const highlightLocationId = route.params?.locationId;
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [pathNames, setPathNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routing, setRouting] = useState(false);
  useEffect(() => {
    getBuildings().then(setBuildings).finally(() => setLoading(false));
  }, []);
  const selectBuilding = async (building) => {
    setSelectedBuilding(building);
    setSelectedFloor(null);
    setLocations([]);
    setStart(null);
    setEnd(null);
    setPathNames([]);
    const nextFloors = await getFloors(building.id);
    setFloors(nextFloors);
  };
  const selectFloor = async (floor) => {
    setSelectedFloor(floor);
    setStart(null);
    setEnd(null);
    setPathNames([]);
    const nextLocations = await getFloorLocations(floor.id);
    setLocations(nextLocations);
  };
  const selectLocation = (location) => {
    if (!start) {
      setStart(location);
      return;
    }
    if (!end) {
      setEnd(location);
      return;
    }
    setStart(location);
    setEnd(null);
    setPathNames([]);
  };
  const runRoute = async () => {
    if (!start || !end) return;
    setRouting(true);
    try {
      const res = await calculateIndoorPath(start.id, end.id);
      setPathNames(res.data.path.map((node) => node.name));
    } catch (e) {
      setPathNames([e.message]);
    } finally {
      setRouting(false);
    }
  };
  if (loading) {
    return <View style={styles.center}>
        <ActivityIndicator size="large" color={BRAND_BLUE} />
      </View>;
  }
  return <View style={styles.container}>
      <Text style={styles.title}>Indoor Navigation</Text>

      <Text style={styles.section}>Buildings</Text>
      <FlatList
    horizontal
    data={buildings}
    keyExtractor={(item) => String(item.id)}
    renderItem={({ item }) => <Pressable
      style={[styles.chip, selectedBuilding?.id === item.id && styles.chipActive]}
      onPress={() => selectBuilding(item)}
    >
            <Text style={styles.chipText}>{item.name}</Text>
          </Pressable>}
  />

      {floors.length > 0 && <>
          <Text style={styles.section}>Floors</Text>
          <FlatList
    horizontal
    data={floors}
    keyExtractor={(item) => String(item.id)}
    renderItem={({ item }) => <Pressable
      style={[styles.chip, selectedFloor?.id === item.id && styles.chipActive]}
      onPress={() => selectFloor(item)}
    >
                <Text style={styles.chipText}>Level {item.level}</Text>
              </Pressable>}
  />
        </>}

      {locations.length > 0 && <>
          <Text style={styles.section}>Tap start, then destination</Text>
          <FlatList
    data={locations}
    keyExtractor={(item) => String(item.id)}
    renderItem={({ item }) => <Pressable style={styles.locationRow} onPress={() => selectLocation(item)}>
                <Text
      style={[
        styles.locationName,
        highlightLocationId === item.id && styles.locationHighlight
      ]}
    >
                  {item.name}
                </Text>
                <Text style={styles.locationMeta}>
                  {start?.id === item.id ? "Start" : end?.id === item.id ? "End" : item.type}
                </Text>
              </Pressable>}
  />
          {start && end && <Pressable style={styles.routeBtn} onPress={runRoute} disabled={routing}>
              <Text style={styles.routeBtnText}>{routing ? "Calculating\u2026" : "Calculate route"}</Text>
            </Pressable>}
          {pathNames.length > 0 && <View style={styles.pathBox}>
              <Text style={styles.pathTitle}>Route</Text>
              <Text style={styles.pathText}>{pathNames.join(" \u2192 ")}</Text>
            </View>}
        </>}
    </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  section: { fontSize: 14, fontWeight: "600", marginVertical: 8, color: "#374151" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    marginRight: 8
  },
  chipActive: { backgroundColor: "#dbeafe" },
  chipText: { fontSize: 13, color: "#111827" },
  locationRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  locationName: { fontSize: 14, fontWeight: "500" },
  locationHighlight: { color: BRAND_BLUE },
  locationMeta: { fontSize: 12, color: "#6b7280" },
  routeBtn: {
    marginTop: 12,
    backgroundColor: BRAND_BLUE,
    borderRadius: 12,
    padding: 14,
    alignItems: "center"
  },
  routeBtnText: { color: "#fff", fontWeight: "600" },
  pathBox: { marginTop: 12, padding: 12, backgroundColor: "#f9fafb", borderRadius: 12 },
  pathTitle: { fontWeight: "700", marginBottom: 4 },
  pathText: { color: "#374151", lineHeight: 20 }
});
export {
  IndoorScreen
};
