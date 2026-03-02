import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function DashboardScreen() {
  const router = useRouter();

  // Mock Data
  const remainingBalance = 24500;
  const spentThisMonth = 15500;
  const totalSalary = 40000;
  const progressPerc = (spentThisMonth / totalSalary) * 100;

  const dailySafeSpend = 850;
  const spentToday = 320;
  const isSafeToday = spentToday <= dailySafeSpend;
  const predictedSavings = 12000;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 pt-16 pb-24">
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 font-medium">Good Morning,</Text>
            <Text className="text-2xl font-bold text-slate-900">Ayush</Text>
          </View>
          <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center">
            <Text className="text-indigo-600 font-bold">A</Text>
          </View>
        </View>

        {/* Main Balance Card */}
        <View className="bg-indigo-600 rounded-3xl p-6 shadow-sm shadow-indigo-300 mb-6">
          <Text className="text-indigo-100 font-medium mb-1">Remaining this month</Text>
          <Text className="text-4xl font-bold text-white mb-6">₹ {remainingBalance.toLocaleString()}</Text>

          <View className="bg-indigo-700/50 rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-indigo-100 font-medium text-sm">Monthly Usage</Text>
              <Text className="text-white font-semibold text-sm">{Math.round(progressPerc)}%</Text>
            </View>
            <View className="h-2 bg-indigo-900/40 rounded-full overflow-hidden">
              <View
                className="h-full bg-green-400 rounded-full"
                style={{ width: `${progressPerc}%` }}
              />
            </View>
          </View>
        </View>

        {/* Today's Stats Row */}
        <View className="flex-row justify-between mb-6 space-x-4">
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm shadow-slate-100 border border-slate-100">
            <Text className="text-slate-500 text-xs font-medium mb-1">Daily Safe Spend</Text>
            <Text className="text-xl font-bold text-slate-900">₹ {dailySafeSpend}</Text>
          </View>
          <View className={`flex-1 rounded-2xl p-4 shadow-sm border ${isSafeToday ? 'bg-emerald-50 border-emerald-100 shadow-emerald-50' : 'bg-red-50 border-red-100 shadow-red-50'}`}>
            <Text className={`text-xs font-medium mb-1 ${isSafeToday ? 'text-emerald-600' : 'text-red-600'}`}>Spent Today</Text>
            <Text className={`text-xl font-bold ${isSafeToday ? 'text-emerald-700' : 'text-red-700'}`}>₹ {spentToday}</Text>
          </View>
        </View>

        {/* Prediction Card */}
        <View className="bg-white rounded-2xl p-5 shadow-sm shadow-slate-100 border border-slate-100 items-center flex-row">
          <View className="w-12 h-12 bg-indigo-50 rounded-full items-center justify-center mr-4">
            <IconSymbol name="star.fill" size={20} color="#4f46e5" />
          </View>
          <View className="flex-1">
            <Text className="text-slate-500 text-xs font-medium mb-1">Smart Prediction</Text>
            <Text className="text-slate-900 font-semibold text-sm">
              At this pace, you will save <Text className="text-green-600 font-bold">₹ {predictedSavings.toLocaleString()}</Text> this month.
            </Text>
          </View>
        </View>

        <View className="h-20" /> {/* Spacer for scroll padding */}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("/add-expense")}
        className="absolute bottom-6 right-6 w-16 h-16 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-300"
      >
        <IconSymbol name="plus" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}