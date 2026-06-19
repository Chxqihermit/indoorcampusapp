import { StyleSheet, Text, View } from "react-native";
import { API_BASE_URL, CAMPUS_WEB_URL } from "@/constants/config";

function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CampusNav</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Mode</Text>
        <Text style={styles.value}>Web app (MapLibre) in WebView</Text>
        <Text style={[styles.label, { marginTop: 12 }]}>Campus URL</Text>
        <Text style={styles.value}>{CAMPUS_WEB_URL}</Text>
        <Text style={[styles.label, { marginTop: 12 }]}>API server</Text>
        <Text style={styles.value}>{API_BASE_URL}</Text>
        <Text style={[styles.hint, { marginTop: 12 }]}>
          The mobile app loads the same web map, search, staff cards, and routing as the browser.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 16 },
  label: { fontSize: 12, color: "#6b7280", textTransform: "uppercase", fontWeight: "600" },
  value: { fontSize: 16, color: "#111827", marginTop: 4 },
  hint: { fontSize: 14, color: "#4b5563", lineHeight: 20 }
});

export { ProfileScreen };
