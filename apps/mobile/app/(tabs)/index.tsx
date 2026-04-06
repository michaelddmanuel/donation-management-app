import { View, Text, Pressable, ScrollView, StyleSheet, Animated as RNAnimated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

function AnimatedCard({ children, delay, style }: { children: React.ReactNode; delay: number; style?: any }) {
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(30)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      RNAnimated.spring(slideAnim, { toValue: 0, delay, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <RNAnimated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, style]}>
      {children}
    </RNAnimated.View>
  );
}

function StatCard({ value, label, icon, color }: { value: string; label: string; icon: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, title, subtitle, gradient, onPress, badge }: {
  icon: string; title: string; subtitle: string; gradient: string[]; onPress?: () => void; badge?: string;
}) {
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;

  return (
    <Pressable
      onPressIn={() => RNAnimated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start()}
      onPressOut={() => RNAnimated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start()}
      onPress={onPress}
    >
      <RNAnimated.View style={[styles.actionCard, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient colors={gradient as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionGradient}>
          <Text style={styles.actionCardIcon}>{icon}</Text>
        </LinearGradient>
        <View style={styles.actionCardContent}>
          <View style={styles.actionCardHeader}>
            <Text style={styles.actionCardTitle}>{title}</Text>
            {badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.actionCardSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.actionArrow}>
          <Text style={styles.actionArrowText}>›</Text>
        </View>
      </RNAnimated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const headerOpacity = useRef(new RNAnimated.Value(0)).current;
  const headerSlide = useRef(new RNAnimated.Value(-20)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      RNAnimated.spring(headerSlide, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <RNAnimated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerSlide }] }]}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.headerTitle}>DonationHub</Text>
          </View>
          <Pressable style={styles.avatarWrap}>
            <LinearGradient colors={["#7C3AED", "#A78BFA"]} style={styles.avatar}>
              <Text style={styles.avatarText}>MA</Text>
            </LinearGradient>
            <View style={styles.onlineDot} />
          </Pressable>
        </RNAnimated.View>

        {/* Status Banner */}
        <AnimatedCard delay={100}>
          <LinearGradient
            colors={["#7C3AED", "#6D28D9", "#5B21B6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusBanner}
          >
            <View style={styles.statusBannerOverlay} />
            <View style={styles.statusContent}>
              <Text style={styles.statusLabel}>YOUR SHIFT</Text>
              <Text style={styles.statusTitle}>Currently Active</Text>
              <Text style={styles.statusSubtitle}>Downtown Chapter • Started 2h ago</Text>
            </View>
            <View style={styles.statusTimer}>
              <Text style={styles.timerText}>02:14</Text>
              <Text style={styles.timerLabel}>hours</Text>
            </View>
          </LinearGradient>
        </AnimatedCard>

        {/* Impact Stats */}
        <AnimatedCard delay={200}>
          <Text style={styles.sectionTitle}>Today's Impact</Text>
          <View style={styles.statsRow}>
            <StatCard value="12" label="Families" icon="🏠" color="#7C3AED" />
            <StatCard value="48" label="Items" icon="📦" color="#10B981" />
            <StatCard value="3.2h" label="Logged" icon="⏱" color="#F59E0B" />
          </View>
        </AnimatedCard>

        {/* Quick Actions */}
        <AnimatedCard delay={300}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <Link href="/new-arrival" asChild>
              <QuickAction
                icon="👤"
                title="Register Arrival"
                subtitle="New beneficiary intake"
                gradient={["#7C3AED", "#A78BFA"]}
              />
            </Link>
            <QuickAction
              icon="📦"
              title="Scan Donation"
              subtitle="AI-powered item recognition"
              gradient={["#10B981", "#34D399"]}
              badge="AI"
            />
            <QuickAction
              icon="🚚"
              title="My Deliveries"
              subtitle="3 routes optimized today"
              gradient={["#3B82F6", "#60A5FA"]}
              badge="3"
            />
            <QuickAction
              icon="📋"
              title="Help Requests"
              subtitle="Pending in your area"
              gradient={["#F59E0B", "#FBBF24"]}
              badge="5"
            />
          </View>
        </AnimatedCard>

        {/* Recent Activity */}
        <AnimatedCard delay={400}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <View style={styles.activityList}>
            {[
              { icon: "✅", text: "Registered Maria Santos", time: "12m ago", color: "#10B981" },
              { icon: "📦", text: "Scanned 8 items – Clothing", time: "45m ago", color: "#3B82F6" },
              { icon: "🚚", text: "Completed Route #4", time: "1h ago", color: "#7C3AED" },
              { icon: "📋", text: "Fulfilled request #127", time: "2h ago", color: "#F59E0B" },
            ].map((item, i) => (
              <Pressable key={i} style={({ pressed }) => [styles.activityItem, pressed && { opacity: 0.7 }]}>
                <View style={[styles.activityDot, { backgroundColor: item.color }]}>
                  <Text style={styles.activityIcon}>{item.icon}</Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{item.text}</Text>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </AnimatedCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFE" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 20,
  },
  greeting: { fontSize: 14, color: "#667085", fontWeight: "500" },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#101828", letterSpacing: -0.5, marginTop: 2 },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FAFAFE",
  },
  statusBanner: {
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    overflow: "hidden",
  },
  statusBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
  },
  statusContent: { flex: 1 },
  statusLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  statusTitle: { fontSize: 20, fontWeight: "700", color: "#FFF" },
  statusSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  statusTimer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  timerText: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  timerLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "600", marginTop: 2 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  seeAll: { fontSize: 14, fontWeight: "600", color: "#7C3AED" },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  statIcon: { fontSize: 18, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: "800", color: "#101828" },
  statLabel: { fontSize: 11, color: "#667085", fontWeight: "500", marginTop: 4 },
  actionsContainer: { gap: 10, marginBottom: 28 },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  actionGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCardIcon: { fontSize: 22 },
  actionCardContent: { flex: 1, marginLeft: 14 },
  actionCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionCardTitle: { fontSize: 15, fontWeight: "700", color: "#101828" },
  actionCardSubtitle: { fontSize: 12, color: "#667085", marginTop: 2 },
  badge: {
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#7C3AED" },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  actionArrowText: { fontSize: 20, color: "#98A2B3", fontWeight: "300" },
  activityList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  activityDot: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.15,
  },
  activityIcon: {
    fontSize: 18,
    position: "absolute",
  },
  activityContent: { flex: 1, marginLeft: 14 },
  activityText: { fontSize: 14, fontWeight: "600", color: "#344054" },
  activityTime: { fontSize: 12, color: "#98A2B3", marginTop: 2 },
});
