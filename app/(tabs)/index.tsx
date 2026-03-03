import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const { height } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();

  const [data, setData] = useState({
    remainingBalance: 0,
    spentThisMonth: 0,
    totalSalary: 0,
    dailySafeSpend: 0,
    spentToday: 0,
    predictedSavings: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const stored = await AsyncStorage.getItem('stipend_setup');
          if (stored) {
            const parsed = JSON.parse(stored);
            setData({
              remainingBalance: parsed.remainingBalance || 0,
              totalSalary: parsed.totalSalary || 0,
              dailySafeSpend: parsed.dailySafeSpend || 0,
              predictedSavings: parsed.predictedSavings || 0,
              spentThisMonth: parsed.spentThisMonth || 0,
              spentToday: parsed.spentToday || 0,
            });
          }
        } catch (e) {
          console.error("Failed to load dashboard data", e);
        }
      };
      loadData();
    }, [])
  );

  const { remainingBalance, spentThisMonth, totalSalary, dailySafeSpend, spentToday, predictedSavings } = data;
  const progressPerc = totalSalary > 0 ? (spentThisMonth / totalSalary) * 100 : 0;
  const isSafeToday = spentToday <= dailySafeSpend;

  return (
    <View className="flex-1 bg-[#2C2B29]">
      <StatusBar style="light" />
      {/* Subtle Background Elements */}
      <View className="absolute top-[-10%] left-[-20%] w-[120vw] h-[40vh] bg-[#D3A77A]/5 rounded-[100%] blur-3xl z-0" />

      <ScrollView
        className="flex-1 px-6 pt-16 pb-24 z-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View entering={FadeInDown.duration(800).delay(100)} className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-[#A7A4A0] font-medium text-sm tracking-wider uppercase mb-1">Good Morning,</Text>
            <Text className="text-[28px] font-black text-[#F2EFEB]">Ayush</Text>
          </View>
          <View className="w-12 h-12 bg-[#3E3A35] rounded-full items-center justify-center border border-[#5D5A54] shadow-lg shadow-black/50">
            <Text className="text-[#D3A77A] font-bold text-lg">A</Text>
          </View>
        </Animated.View>

        {/* Main Premium Balance Card */}
        <Animated.View entering={FadeInDown.duration(800).delay(200)} className="bg-[#383633] rounded-[32px] p-7 shadow-[0_20px_40px_rgba(0,0,0,0.6)] border-[1.5px] border-[#4E4B47] mb-8 relative overflow-hidden">
          {/* Internal Card Decor */}
          <View className="absolute -right-8 -top-8 w-32 h-32 bg-[#D3A77A]/10 rounded-full" />
          <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#D3A77A]/5 rounded-full" />

          <Text className="text-[#A7A4A0] font-semibold text-xs tracking-widest uppercase mb-2">Available Stipend</Text>
          <Text className="text-[42px] font-black text-[#D3A77A] mb-8 tracking-tighter">
            <Text className="text-3xl text-[#A87D56] mr-1">₹</Text>{remainingBalance.toLocaleString()}
          </Text>

          <View className="bg-[#2C2B29]/60 rounded-2xl p-4 border border-[#4A4845]">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-[#A7A4A0] font-medium text-xs uppercase tracking-wider">Montly Usage</Text>
              <Text className="text-[#F2EFEB] font-bold text-sm tracking-wide">{Math.round(progressPerc)}%</Text>
            </View>
            <View className="h-[6px] bg-[#3E3A35] rounded-full overflow-hidden">
              <View
                className="h-full bg-[#D3A77A] rounded-full"
                style={{ width: `${progressPerc}%` }}
              />
            </View>
          </View>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.duration(800).delay(300)} className="flex-row justify-between mb-8 space-x-4">
          <View className="flex-1 bg-[#3E3A35] rounded-[24px] p-5 shadow-lg shadow-black/30 border border-[#4E4B47]">
            <View className="w-8 h-8 rounded-full bg-[#2C2B29] items-center justify-center mb-3 border border-[#5D5A54]">
              <Ionicons name="shield-checkmark" size={14} color="#A7A4A0" />
            </View>
            <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Safe Spend</Text>
            <Text className="text-xl font-bold text-[#F2EFEB]">₹{dailySafeSpend}</Text>
          </View>

          <View className={`flex-1 rounded-[24px] p-5 shadow-lg border ${isSafeToday ? 'bg-[#3E3A35] border-[#4E4B47] shadow-black/30' : 'bg-[#4A2F2F] border-[#663A3A] shadow-black/30'}`}>
            <View className={`w-8 h-8 rounded-full items-center justify-center mb-3 border ${isSafeToday ? 'bg-[#2C2B29] border-[#5D5A54]' : 'bg-[#382020] border-[#5C2B2B]'}`}>
              <Ionicons name={isSafeToday ? "trending-down" : "warning"} size={14} color={isSafeToday ? "#D3A77A" : "#EF6C6C"} />
            </View>
            <Text className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isSafeToday ? 'text-[#D3A77A]' : 'text-[#EF6C6C]'}`}>Spent Today</Text>
            <Text className={`text-xl font-bold ${isSafeToday ? 'text-[#F2EFEB]' : 'text-[#FFE5E5]'}`}>₹{spentToday}</Text>
          </View>
        </Animated.View>

        {/* Prediction Card */}
        <Animated.View entering={FadeInDown.duration(800).delay(400)} className="bg-[#383633] rounded-[24px] p-5 shadow-lg shadow-black/40 border border-[#4E4B47] flex-row items-center">
          <View className="w-12 h-12 bg-[#2C2B29] rounded-xl items-center justify-center mr-4 border border-[#5D5A54]">
            <Ionicons name="sparkles" size={20} color="#D3A77A" />
          </View>
          <View className="flex-1">
            <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Smart Projection</Text>
            <Text className="text-[#F2EFEB] leading-[20px] text-sm">
              At this pace, you will retain <Text className="text-[#D3A77A] font-bold">₹{predictedSavings.toLocaleString()}</Text> of your stipend.
            </Text>
          </View>
        </Animated.View>

        <View className="h-32" /> {/* Extra Spacer for FAB & Tab Bar */}
      </ScrollView>

      {/* Floating Action Button (Premium Gold Pill) */}
      <Animated.View entering={FadeInUp.duration(600).delay(600)} className="absolute bottom-[20px] self-center z-50">
        <TouchableOpacity
          onPress={() => router.push("/add-expense")}
          activeOpacity={0.8}
          className="bg-[#D3A77A] rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
          style={{ elevation: 15 }}
        >
          <View className="px-6 py-4 rounded-full flex-row items-center justify-center bg-[#D1A677] border-t border-t-[#EACFA7] border-b border-b-[#A87D56]">
            <Ionicons name="add" size={20} color="#2B231A" />
            <Text className="text-[#2B231A] font-extrabold text-sm tracking-widest uppercase ml-2">
              New Action
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
