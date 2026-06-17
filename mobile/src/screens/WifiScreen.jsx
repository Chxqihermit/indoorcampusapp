import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { getWifiAccessPoints, scanWifiNetworks } from "@/api/campus";
function WifiScreen() {
  const [networks, setNetworks] = useState([]);
  const [accessPoints, setAccessPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("WiFi scanning uses the Laravel backend. On device, native WiFi plugins may be required for live scans.");
  const scan = async () => {
    setLoading(true);
    setMessage("");
    try {
      const data = await scanWifiNetworks();
      setNetworks(data);
      if (data.length === 0) setMessage("No networks returned from server scan.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };
  const loadFloorAps = async () => {
    setLoading(true);
    try {
      const data = await getWifiAccessPoints(1);
      setAccessPoints(data);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };
  return <View style={styles.container}>
      <Text style={styles.title}>WiFi Positioning</Text>
      <Text style={styles.note}>{message}</Text>

      <Pressable style={styles.btn} onPress={scan} disabled={loading}>
        <Text style={styles.btnText}>Scan networks (API)</Text>
      </Pressable>
      <Pressable style={[styles.btn, styles.btnSecondary]} onPress={loadFloorAps} disabled={loading}>
        <Text style={styles.btnText}>Load floor access points</Text>
      </Pressable>

      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}

      {networks.length > 0 && <>
          <Text style={styles.section}>Nearby networks</Text>
          <FlatList
    data={networks}
    keyExtractor={(item) => `${item.bssid}-${item.ssid}`}
    renderItem={({ item }) => <View style={styles.row}>
                <Text style={styles.rowTitle}>{item.ssid || "(hidden)"}</Text>
                <Text style={styles.rowMeta}>{item.bssid} · {item.rssi} dBm</Text>
              </View>}
  />
        </>}

      {accessPoints.length > 0 && <>
          <Text style={styles.section}>Calibrated access points</Text>
          <FlatList
    data={accessPoints}
    keyExtractor={(item) => String(item.id)}
    renderItem={({ item }) => <View style={styles.row}>
                <Text style={styles.rowTitle}>{item.ssid}</Text>
                <Text style={styles.rowMeta}>{item.bssid}</Text>
              </View>}
  />
        </>}
    </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  note: { color: "#6b7280", marginBottom: 16, lineHeight: 20 },
  btn: { backgroundColor: "#2563eb", borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 8 },
  btnSecondary: { backgroundColor: "#111827" },
  btnText: { color: "#fff", fontWeight: "600" },
  section: { marginTop: 16, marginBottom: 8, fontWeight: "600" },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  rowTitle: { fontWeight: "600" },
  rowMeta: { color: "#6b7280", fontSize: 12, marginTop: 2 }
});
export {
  WifiScreen
};
