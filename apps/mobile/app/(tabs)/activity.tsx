import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACTIVITIES = [
  { type: "register", icon: "👤", title: "Registered new arrival", name: "Maria Santos", time: "12 min ago", status: "completed" },
  { type: "scan", icon: "📦", title: "Scanned 12 items", name: "Clothing Bundle", time: "35 min ago", status: "completed" },
  { type: "delivery", icon: "🚚", title: "Delivery completed", name: "Route #4 - Downtown", time: "1 hr ago", status: "completed" },
  { type: "request", icon: "📋", title: "Request fulfilled", name: "Family Essentials Kit", time: "2 hrs ago", status: "completed" },
  { type: "register", icon: "👤", title: "Registered new arrival", name: "Ahmad Hassan", time: "3 hrs ago", status: "completed" },
  { type: "scan", icon: "📦", title: "Sorted donations", name: "Food & Hygiene", time: "4 hrs ago", status: "completed" },
  { type: "delivery", icon: "🚚", title: "Pickup completed", name: "Donor - J. Wilson", time: "Yesterday", status: "completed" },
  { type: "request", icon: "📋", title: "Request assigned", name: "Medical Supplies", time: "Yesterday", status: "pending" },
];

const COLORS: Record<string, string> = {
  register: "#7C3AED",
  scan: "#10B981",
  delivery: "#3B82F6",
  request: "#F59E0B",
};

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Pressable style={styles.filterBtn}>
          <Text style={styles.filterText}>This Week ▾</Text>
        </Pressable>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        {[
          { label: "Total Actions", value: "34", delta: "+12%" },
          { label: "Hours Logged", value: "18.5", delta: "+8%" },
        ].map((s) => (
          <View key={s.label} style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
            <View style={styles.deltaWrap}>
              <Text style={styles.deltaText}>{s.delta}</Text>
            </View>
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.sectionLabel}>RECENT</Text>
        {ACTIVITIES.map((a, i) => (
          <Pressable key={i} style={({ pressed }) => [styles.actItem, pressed && { opacity: 0.7 }]}>
            <View style={[styles.actDot, { backgroundColor: COLORS[a.type] + "20" }]}>
              <Text style={styles.actIcon}>{a.icon}</Text>
            </View>
            <View style={styles.actContent}>
              <Text style={styles.actTitle}>{a.title}</Text>
              <Text style={styles.actName}>{a.name}</Text>
            </View>
            <View style={styles.actMeta}>
              <Text style={styles.actTime}>{a.time}</Text>
              <View style={[styles.statusDot, { backgroundColor: a.status === "completed" ? "#10B981" : "#F59E0B" }]} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFE", paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: "800", color: "#101828", letterSpacing: -0.5 },
  filterBtn: { backgroundColor: "#F2F4F7", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  filterText: { fontSize: 13, fontWeight: "600", color: "#344054" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  summaryCard: { flex: 1, backgroundColor: "#FFF", borderRadius: 18, padding: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1 },
  summaryValue: { fontSize: 28, fontWeight: "800", color: "#101828" },
  summaryLabel: { fontSize: 12, color: "#667085", fontWeight: "500", marginTop: 4 },
  deltaWrap: { backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start", marginTop: 8 },
  deltaText: { fontSize: 11, fontWeight: "700", color: "#10B981" },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#98A2B3", letterSpacing: 1.2, marginBottom: 12 },
  actItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 16, padding: 14, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  actDot: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  actIcon: { fontSize: 20 },
  actContent: { flex: 1, marginLeft: 14 },
  actTitle: { fontSize: 14, fontWeight: "600", color: "#344054" },
  actName: { fontSize: 12, color: "#98A2B3", marginTop: 2 },
  actMeta: { alignItems: "flex-end" },
  actTime: { fontSize: 11, color: "#98A2B3" },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
});
