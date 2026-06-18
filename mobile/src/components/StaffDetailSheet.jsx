import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { staffInitials } from "@/components/staffInitials";
import { BRAND_BLUE, BRAND_BLUE_50 } from "@/constants/colors";

function StaffDetailSheet({ staff, collapsed, onToggle, onClose, onDirections }) {
  if (!staff) return null;

  const buildingLine = [staff.buildingName, staff.roomNo ? `Room ${staff.roomNo}` : ""]
    .filter(Boolean)
    .join(" · ");

  if (collapsed) {
    return (
      <Pressable style={styles.peek} onPress={onToggle} accessibilityRole="button" accessibilityLabel={`Show details for ${staff.name}`}>
        <View style={styles.peekAvatar}>
          <Text style={styles.peekAvatarText}>{staffInitials(staff.name)}</Text>
        </View>
        <Text style={styles.peekName} numberOfLines={1}>{staff.name}</Text>
        <Text style={styles.peekChevron}>⌃</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.sheet}>
      <Pressable style={styles.grabArea} onPress={onToggle} accessibilityLabel="Minimize">
        <View style={styles.grabBar} />
      </Pressable>

      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{staffInitials(staff.name)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{staff.name}</Text>
          <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Close">
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>

        {staff.staffPosition ? <Text style={styles.role}>{staff.staffPosition}</Text> : null}
        {buildingLine ? <Text style={styles.meta}>{buildingLine}</Text> : null}

        {staff.email ? (
          <Pressable onPress={() => Linking.openURL(`mailto:${staff.email}`)}>
            <Text style={styles.email}>{staff.email}</Text>
          </Pressable>
        ) : null}

        {staff.subtitle ? <Text style={styles.subtitle}>{staff.subtitle}</Text> : null}

        <Pressable style={styles.directionsBtn} onPress={onDirections}>
          <Text style={styles.directionsBtnText}>Directions</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  peek: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8
  },
  peekAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center"
  },
  peekAvatarText: { fontSize: 12, fontWeight: "700", color: "#374151" },
  peekName: { flex: 1, fontSize: 16, fontWeight: "700", color: "#111827" },
  peekChevron: { fontSize: 18, color: "#6b7280" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "58%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10
  },
  grabArea: { alignItems: "center", paddingTop: 10, paddingBottom: 4 },
  grabBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#d1d5db" },
  hero: {
    height: 72,
    backgroundColor: BRAND_BLUE,
    marginBottom: 28
  },
  avatar: {
    position: "absolute",
    left: 16,
    bottom: -24,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#374151" },
  body: { paddingHorizontal: 16, paddingBottom: 20 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  name: { flex: 1, fontSize: 18, fontWeight: "700", color: "#111827" },
  closeBtn: { fontSize: 18, color: "#6b7280", padding: 4 },
  role: { marginTop: 4, fontSize: 14, color: "#4b5563" },
  meta: { marginTop: 8, fontSize: 14, color: "#374151" },
  email: { marginTop: 8, fontSize: 14, color: BRAND_BLUE },
  subtitle: { marginTop: 8, fontSize: 12, color: "#6b7280" },
  directionsBtn: {
    marginTop: 16,
    alignSelf: "flex-start",
    backgroundColor: BRAND_BLUE_50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999
  },
  directionsBtnText: { color: BRAND_BLUE, fontWeight: "700", fontSize: 14 }
});

export { StaffDetailSheet };
