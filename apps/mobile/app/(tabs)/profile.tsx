import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.title}>Profile</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient colors={["#7C3AED", "#A78BFA"]} style={styles.avatarLg}>
            <Text style={styles.avatarLgText}>MA</Text>
          </LinearGradient>
          <Text style={styles.name}>Michael Admin</Text>
          <Text style={styles.role}>Volunteer Coordinator</Text>
          <View style={styles.chapterBadge}>
            <Text style={styles.chapterText}>📍 Downtown Chapter</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Total Hours", value: "142", icon: "⏱" },
            { label: "Families", value: "89", icon: "🏠" },
            { label: "Deliveries", value: "37", icon: "🚚" },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {[
            { icon: "🔔", label: "Notifications", badge: "3" },
            { icon: "📊", label: "My Reports", badge: null },
            { icon: "🏆", label: "Achievements", badge: "New" },
            { icon: "⚙️", label: "Settings", badge: null },
            { icon: "❓", label: "Help & Support", badge: null },
          ].map((item) => (
            <Pressable key={item.label} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: "#F9FAFB" }]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge && (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>{item.badge}</Text>
                </View>
              )}
              <Text style={styles.menuArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.version}>DonationHub v2.0 • Expo SDK 54</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFE", paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "800", color: "#101828", letterSpacing: -0.5, paddingTop: 8, marginBottom: 24 },
  profileCard: { alignItems: "center", backgroundColor: "#FFF", borderRadius: 22, padding: 28, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1 },
  avatarLg: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  avatarLgText: { color: "#FFF", fontSize: 28, fontWeight: "800" },
  name: { fontSize: 22, fontWeight: "800", color: "#101828" },
  role: { fontSize: 14, color: "#667085", fontWeight: "500", marginTop: 4 },
  chapterBadge: { backgroundColor: "#F5F3FF", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, marginTop: 12 },
  chapterText: { fontSize: 13, fontWeight: "600", color: "#7C3AED" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: "#FFF", borderRadius: 18, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1 },
  statIcon: { fontSize: 18, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: "800", color: "#101828" },
  statLabel: { fontSize: 11, color: "#667085", fontWeight: "500", marginTop: 4 },
  menuSection: { backgroundColor: "#FFF", borderRadius: 18, overflow: "hidden", marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F2F4F7" },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: "#344054" },
  menuBadge: { backgroundColor: "#F5F3FF", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 8 },
  menuBadgeText: { fontSize: 11, fontWeight: "700", color: "#7C3AED" },
  menuArrow: { fontSize: 22, color: "#D0D5DD" },
  logoutBtn: { height: 50, borderRadius: 16, backgroundColor: "#FEF3F2", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoutText: { fontSize: 15, fontWeight: "600", color: "#F04438" },
  version: { textAlign: "center", fontSize: 12, color: "#98A2B3", marginBottom: 20 },
});
