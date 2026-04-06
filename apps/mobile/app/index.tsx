import { Link } from "expo-router";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 tracking-tight">
            DonationHub
          </Text>
          <Text className="text-base text-gray-500 mt-1">
            Volunteer Operations
          </Text>
        </View>

        {/* Quick Actions */}
        <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Quick Actions
        </Text>

        <View className="gap-3">
          <Link href="/new-arrival" asChild>
            <Pressable className="flex-row items-center bg-primary-50 border border-primary-100 rounded-2xl p-4 active:opacity-80">
              <View className="w-12 h-12 rounded-xl bg-primary-600 items-center justify-center mr-4">
                <Text className="text-white text-xl">👤</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Register New Arrival
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Capture ID, photo & details
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">→</Text>
            </Pressable>
          </Link>

          <Pressable className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl p-4 active:opacity-80">
            <View className="w-12 h-12 rounded-xl bg-emerald-600 items-center justify-center mr-4">
              <Text className="text-white text-xl">📦</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                Scan Donation
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                AI-powered item recognition
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </Pressable>

          <Pressable className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl p-4 active:opacity-80">
            <View className="w-12 h-12 rounded-xl bg-blue-600 items-center justify-center mr-4">
              <Text className="text-white text-xl">🚚</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                My Deliveries
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                View optimized routes
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </Pressable>

          <Pressable className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl p-4 active:opacity-80">
            <View className="w-12 h-12 rounded-xl bg-amber-600 items-center justify-center mr-4">
              <Text className="text-white text-xl">📋</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                Help Requests
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                3 pending in your area
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">→</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-3">
          Today&apos;s Impact
        </Text>
        <View className="flex-row gap-3 mb-8">
          <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
            <Text className="text-2xl font-bold text-gray-900">12</Text>
            <Text className="text-xs text-gray-500 mt-1">Families Helped</Text>
          </View>
          <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
            <Text className="text-2xl font-bold text-gray-900">48</Text>
            <Text className="text-xs text-gray-500 mt-1">Items Distributed</Text>
          </View>
          <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
            <Text className="text-2xl font-bold text-gray-900">3.2</Text>
            <Text className="text-xs text-gray-500 mt-1">Hours Logged</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
