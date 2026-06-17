import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { searchCampus } from "@/api/campus";
const SCOPES = [
  { id: "all", label: "All" },
  { id: "staff", label: "Staff" },
  { id: "building", label: "Buildings" }
];
function CampusSearchBar({ scope, onScopeChange, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await searchCampus(query, scope);
        setResults(found);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, scope]);
  return <View style={styles.container}>
      <View style={styles.scopeRow}>
        {SCOPES.map((item) => <Pressable
    key={item.id}
    onPress={() => onScopeChange(item.id)}
    style={[styles.scopeBtn, scope === item.id && styles.scopeBtnActive]}
  >
            <Text style={[styles.scopeText, scope === item.id && styles.scopeTextActive]}>{item.label}</Text>
          </Pressable>)}
      </View>

      <TextInput
    value={query}
    onChangeText={setQuery}
    placeholder={scope === "staff" ? "Search staff by name\u2026" : scope === "building" ? "Search buildings\u2026" : "Search campus\u2026"}
    style={styles.input}
    autoCorrect={false}
  />

      {loading && <ActivityIndicator style={styles.loader} />}

      {results.length > 0 && <FlatList
    data={results}
    keyExtractor={(item) => item.id}
    keyboardShouldPersistTaps="handled"
    style={styles.results}
    renderItem={({ item }) => <Pressable
      style={styles.resultItem}
      onPress={() => {
        onSelect(item);
        setQuery("");
        setResults([]);
      }}
    >
              <Text style={styles.resultTitle}>{item.name}</Text>
              <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
            </Pressable>}
  />}
    </View>;
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 320
  },
  scopeRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  scopeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f3f4f6"
  },
  scopeBtnActive: { backgroundColor: "#2563eb" },
  scopeText: { fontSize: 12, color: "#374151", fontWeight: "600" },
  scopeTextActive: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15
  },
  loader: { marginTop: 8 },
  results: { marginTop: 8, maxHeight: 180 },
  resultItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  resultTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  resultSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 }
});
export {
  CampusSearchBar
};
