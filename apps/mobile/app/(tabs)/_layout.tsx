import { Tabs } from "expo-router";
import { View, Pressable, Text, StyleSheet, Animated as RNAnimated } from "react-native";
import { useRef, useState, useCallback } from "react";
import { BlurView } from "expo-blur";

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
}

function FABButton({ onPress }: { onPress: () => void }) {
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;

  const handlePressIn = () => {
    RNAnimated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    RNAnimated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <RNAnimated.View style={[styles.fab, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.fabInner}>
          <Text style={styles.fabIcon}>＋</Text>
        </View>
      </RNAnimated.View>
    </Pressable>
  );
}

function QuickActionModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const slideAnim = useRef(new RNAnimated.Value(300)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0)).current;

  if (visible) {
    RNAnimated.parallel([
      RNAnimated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
      RNAnimated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }

  const handleClose = useCallback(() => {
    RNAnimated.parallel([
      RNAnimated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }),
      RNAnimated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  }, [onClose, slideAnim, opacityAnim]);

  if (!visible) return null;

  const actions = [
    { icon: "👤", label: "Register Arrival", desc: "New beneficiary intake", href: "/new-arrival" },
    { icon: "📦", label: "Scan Donation", desc: "AI item recognition", href: null },
    { icon: "🚚", label: "Start Delivery", desc: "Optimized route", href: null },
    { icon: "📋", label: "Log Activity", desc: "Track volunteer hours", href: null },
    { icon: "📸", label: "Quick Photo", desc: "Capture & attach", href: null },
    { icon: "🆘", label: "Report Issue", desc: "Flag a problem", href: null },
  ];

  return (
    <RNAnimated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
      <Pressable style={styles.modalBackdrop} onPress={handleClose} />
      <RNAnimated.View style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]}
              onPress={handleClose}
            >
              <View style={styles.actionIconWrap}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionDesc}>{action.desc}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.cancelBtn} onPress={handleClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </RNAnimated.View>
    </RNAnimated.View>
  );
}

export default function TabsLayout() {
  const [showActions, setShowActions] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Activity" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="actions"
          options={{
            tabBarButton: () => <FABButton onPress={() => setShowActions(true)} />,
          }}
        />
        <Tabs.Screen
          name="deliveries"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🚚" label="Routes" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} />,
          }}
        />
      </Tabs>
      <QuickActionModal visible={showActions} onClose={() => setShowActions(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderTopWidth: 0,
    elevation: 0,
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    minWidth: 56,
  },
  tabIcon: { fontSize: 22 },
  tabIconActive: { fontSize: 24 },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#98A2B3",
    marginTop: 2,
  },
  tabLabelActive: {
    color: "#7C3AED",
    fontWeight: "700",
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#7C3AED",
    marginTop: 3,
  },
  fab: {
    top: -28,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fabInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  fabIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "300",
    marginTop: -1,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#EAECF0",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionItem: {
    width: "30%",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
  },
  actionItemPressed: {
    backgroundColor: "#F5F3FF",
    transform: [{ scale: 0.96 }],
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: { fontSize: 22 },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#344054",
    textAlign: "center",
  },
  actionDesc: {
    fontSize: 10,
    color: "#98A2B3",
    textAlign: "center",
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: 20,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667085",
  },
});
