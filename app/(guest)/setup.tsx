import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function GuestSetupScreen() {
    const router = useRouter();
    const [salary, setSalary] = useState("");
    const [spent, setSpent] = useState("");

    const handleSave = async () => {
        const salaryNum = parseFloat(salary) || 0;
        const spentNum = parseFloat(spent) || 0;
        const remaining = salaryNum - spentNum;

        // Calculate basic stats for demonstration
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const daysLeft = daysInMonth - new Date().getDate() + 1;
        const dailySafe = remaining > 0 ? (remaining / daysLeft).toFixed(0) : "0";

        const setupData = {
            totalSalary: salaryNum,
            spentThisMonth: spentNum,
            remainingBalance: remaining,
            dailySafeSpend: dailySafe,
            spentToday: 0,
            predictedSavings: remaining,
            isGuest: true
        };

        await AsyncStorage.setItem('stipend_setup', JSON.stringify(setupData));
        router.replace("/dashboard");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-[#2C2B29]"
        >
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-20">
                <Animated.View entering={FadeInDown.duration(800)} className="mb-10">
                    <Text className="text-[#D3A77A] text-4xl font-black mb-2">Guest Setup</Text>
                    <Text className="text-[#A7A4A0] text-lg">Enter details to see how it works. No account needed.</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(800)} className="space-y-6">
                    <View>
                        <Text className="text-[#D3A77A] font-bold uppercase tracking-widest text-xs mb-3">Target Stipend / Salary</Text>
                        <TextInput
                            value={salary}
                            onChangeText={setSalary}
                            placeholder="e.g. 25000"
                            placeholderTextColor="#5D5A54"
                            keyboardType="numeric"
                            className="bg-[#383633] text-[#F2EFEB] p-5 rounded-2xl border border-[#4E4B47] text-xl font-bold"
                        />
                    </View>

                    <View>
                        <Text className="text-[#D3A77A] font-bold uppercase tracking-widest text-xs mb-3">Already Spent (Optional)</Text>
                        <TextInput
                            value={spent}
                            onChangeText={setSpent}
                            placeholder="e.g. 5000"
                            placeholderTextColor="#5D5A54"
                            keyboardType="numeric"
                            className="bg-[#383633] text-[#F2EFEB] p-5 rounded-2xl border border-[#4E4B47] text-xl font-bold"
                        />
                    </View>
                </Animated.View>

                <View className="flex-1 justify-end pb-12">
                    <TouchableOpacity
                        onPress={handleSave}
                        activeOpacity={0.8}
                        className="bg-[#D3A77A] rounded-full shadow-xl shadow-black/40"
                    >
                        <View className="py-5 items-center justify-center flex-row bg-[#D1A677] border-t border-t-[#EACFA7] border-b border-b-[#A87D56] rounded-full">
                            <Text className="text-[#2B231A] font-extrabold text-[16px] tracking-widest uppercase mr-2">
                                Launch Dashboard
                            </Text>
                            <Ionicons name="rocket" size={20} color="#2B231A" />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
