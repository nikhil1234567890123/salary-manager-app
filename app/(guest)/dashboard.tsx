import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";

const { height } = Dimensions.get('window');

export default function GuestDashboardScreen() {
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
                        setData(parsed);
                    }
                } catch (e) {
                    console.error("Failed to load guest dashboard data", e);
                }
            };
            loadData();
        }, [])
    );

    const { remainingBalance, spentThisMonth, totalSalary, dailySafeSpend, spentToday, predictedSavings } = data;
    const progressPerc = totalSalary > 0 ? (spentThisMonth / totalSalary) * 100 : 0;

    return (
        <View className="flex-1 bg-[#2C2B29]">
            <StatusBar style="light" />
            <View className="absolute top-[-10%] left-[-20%] w-[120vw] h-[40vh] bg-[#D3A77A]/5 rounded-[100%] blur-3xl z-0" />

            <ScrollView className="flex-1 px-6 pt-16 pb-24 z-10" showsVerticalScrollIndicator={false}>
                {/* Guest Header */}
                <Animated.View entering={FadeInDown.duration(800).delay(100)} className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-[#A7A4A0] font-medium text-sm tracking-wider uppercase mb-1">Guest Mode</Text>
                        <Text className="text-[28px] font-black text-[#F2EFEB]">Previewing Stats</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.replace("/login")}
                        className="px-4 py-2 bg-[#D3A77A]/10 border border-[#D3A77A]/30 rounded-full"
                    >
                        <Text className="text-[#D3A77A] font-bold text-xs uppercase">Sign In</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Conditional Balance Card */}
                {totalSalary > 0 && (
                    <Animated.View entering={FadeInDown.duration(800).delay(200)} className="bg-[#383633] rounded-[32px] p-7 shadow-2xl border-[1.5px] border-[#4E4B47] mb-8">
                        <Text className="text-[#A7A4A0] font-semibold text-xs tracking-widest uppercase mb-2">Estimated Balance</Text>
                        <Text className="text-[42px] font-black text-[#D3A77A] mb-8 tracking-tighter">
                            <Text className="text-3xl text-[#A87D56] mr-1">₹</Text>{remainingBalance.toLocaleString()}
                        </Text>

                        <View className="bg-[#2C2B29]/60 rounded-2xl p-4 border border-[#4A4845]">
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-[#A7A4A0] font-medium text-xs uppercase tracking-wider">Simulated Usage</Text>
                                <Text className="text-[#F2EFEB] font-bold text-sm tracking-wide">{Math.round(progressPerc)}%</Text>
                            </View>
                            <View className="h-[6px] bg-[#3E3A35] rounded-full overflow-hidden">
                                <View className="h-full bg-[#D3A77A] rounded-full" style={{ width: `${progressPerc}%` }} />
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* Stats Row */}
                <Animated.View entering={FadeInDown.duration(800).delay(300)} className="flex-row justify-between mb-8 space-x-4">
                    <View className="flex-1 bg-[#3E3A35] rounded-[24px] p-5 border border-[#4E4B47]">
                        <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Safe Spend</Text>
                        <Text className="text-xl font-bold text-[#F2EFEB]">₹{dailySafeSpend}</Text>
                    </View>
                    <View className="flex-1 bg-[#3E3A35] rounded-[24px] p-5 border border-[#4E4B47]">
                        <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Savings</Text>
                        <Text className="text-xl font-bold text-[#D3A77A]">₹{predictedSavings.toLocaleString()}</Text>
                    </View>
                </Animated.View>

                {/* Fixed CTA Button - No Overlap */}
                <Animated.View entering={FadeInDown.duration(800).delay(500)} className="mt-4">
                    <TouchableOpacity
                        onPress={() => router.replace("/register")}
                        activeOpacity={0.8}
                        className="bg-[#D3A77A] rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <View className="p-6 items-center bg-[#D1A677] border-t border-t-[#EACFA7]">
                            <Text className="text-[#2B231A] font-black text-lg mb-1">Create Perfect Free Account</Text>
                            <Text className="text-[#2B231A]/70 text-xs font-bold uppercase tracking-tighter">Sync your data and unlock full features</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
