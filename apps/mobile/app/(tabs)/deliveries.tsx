import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ROUTES = [
  { id: "R-042", stops: 4, distance: "8.2 mi", eta: "1h 20m", status: "active", items: 12, area: "Downtown" },
  { id: "R-043", stops: 3, distance: "5.1 mi", eta: "45m", status: "upcoming", items: 8, area: "Eastside" },
  { id: "R-044", stops: 6, distance: "12.4 mi", eta: "2h 10m", status: "upcoming", items: 22, area: "Northgate" },
];

export default function DeliveriesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Routes</Text>
        <View style={styles.todayBadge}>
          <Text style={styles.todayText}>Today</Text>
        </View>
      </View>

      {/* Active Route Banner */}
      <View style={styles.activeBanner}>
        <View style={styles.pulseWrap}>
          <View style={styles.pulseDot} />
          <Text style={styles.pulseLabel}>ACTIVE NOW</Text>
        </View>
        <Text style={styles.activeTitle}>Route R-042 • Downtown</Text>
        <View style={styles.activeStats}>
          <View style={styles.activeStat}>
            <Text style={styles.activeStatValue}>2/4</Text>
            <Text style={styles.activeStatLabel}>Stops</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.activeStat}>
            <Text style={styles.activeStatValue}>8.2</Text>
            <Text style={styles.activeStatLabel}>Miles</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.activeStat}>
            <Text style={styles.activeStatValue}>42m</Text>
            <Text style={styles.activeStatLabel}>ETA</Text>
          </View>
        </View>
        <Pressable style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.8 }]}>
          <Text style={styles.navBtnText}>Open Navigation →</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.sectionLabel}>ALL ROUTES</Text>
        {ROUTES.map((route) => (
          <Pressable key={route.id} style={({ pressed }) => [styles.routeCard, pressed && { opacity: 0.7 }]}>
            <View style={styles.routeHeader}>
              <View style={styles.routeIdWrap}>
                <Text style={styles.routeId}>{route.id}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: route.status === "active" ? "#ECFDF5" : "#F2F4F7" }]}>
                <View style={[styles.statusBadgeDot, { backgroundColor: route.status === "active" ? "#10B981" : "#98A2B3" }]} />
                <Text style={[styles.statusBadgeText, { color: route.status === "active" ? "#10B981" : "#667085" }]}>
                  {route.status === "active" ? "Active" : "Upcoming"}
                </Text>
              </View>
            </View>
            <Text style={styles.routeArea}>{route.area} Area</Text>
            <View style={styles.routeStats}>
              <Text style={styles.routeStat}>🛑 {route.stops} stops</Text>
              <Text style={styles.routeStat}>📏 {route.distance}</Text>
              <Text style={styles.routeStat}>⏱ {route.eta}</Text>
              <Text style={styles.routeStat}>📦 {route.items} items</Text>
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
  todayBadge: { backgroundColor: "#F5F3FF", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  todayText: { fontSize: 13, fontWeight: "700", color: "#7C3AED" },
  activeBanner: { backgroundColor: "#101828", borderRadius: 22, padding: 22, marginBottom: 24 },
  pulseWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981" },
  pulseLabel: { fontSize: 10, fontWeight: "700", color: "#10B981", letterSpacing: 1.2 },
  activeTitle: { fontSize: 18, fontWeight: "700", color: "#FFF", marginBottom: 16 },
  activeStats: { flexDirection: "row", marginBottom: 18 },
  activeStat: { flex: 1, alignItems: "center" },
  activeStatValue: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  activeStatLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: "500", marginTop: 2 },
  divider: { width: 1, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 8 },
  navBtn: { backgroundColor: "#7C3AED", borderRadius: 14, height: 48, alignItems: "center", justifyContent: "center" },
  navBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#98A2B3", letterSpacing: 1.2, marginBottom: 12 },
  routeCard: { backgroundColor: "#FFF", borderRadius: 18, padding: 18, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1 },
  routeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  routeIdWrap: { backgroundColor: "#F2F4F7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  routeId: { fontSize: 13, fontWeight: "700", color: "#344054" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeDot: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontSize: 12, fontWeight: "600" },
  routeArea: { fontSize: 16, fontWeight: "700", color: "#101828", marginBottom: 10 },
  routeStats: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  routeStat: { fontSize: 12, color: "#667085", fontWeight: "500" },
});
