import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/constants/config";
function ProfileScreen() {
  const { user, logout } = useAuth();
  return <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name}</Text>
        <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={[styles.label, { marginTop: 12 }]}>API</Text>
        <Text style={styles.value}>{API_BASE_URL}</Text>
      </View>

      <Pressable style={styles.btn} onPress={() => logout()}>
        <Text style={styles.btnText}>Sign out</Text>
      </Pressable>
    </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 16, marginBottom: 16 },
  label: { fontSize: 12, color: "#6b7280", textTransform: "uppercase", fontWeight: "600" },
  value: { fontSize: 16, color: "#111827", marginTop: 4 },
  btn: { backgroundColor: "#dc2626", borderRadius: 12, padding: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" }
});
export {
  ProfileScreen
};
