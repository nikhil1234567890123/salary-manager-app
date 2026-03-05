import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import { useRouter } from "expo-router";
import { useFinance } from '@/context/FinanceContext';
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";
import ConfirmDialog, { AlertDialog } from '@/components/ConfirmDialog';

export default function SettingsScreen() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const router = useRouter();
    const { resetMonth } = useFinance();

    // Dialog state
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showResetDone, setShowResetDone] = useState(false);

    const handleResetMonth = () => {
        setShowResetConfirm(true);
    };

    const confirmReset = async () => {
        setShowResetConfirm(false);
        await resetMonth();
        setShowResetDone(true);
    };

    return (
        <View className="flex-1 bg-[#2C2B29]">
            <StatusBar style="light" />
            <ScrollView className="flex-1 px-6 pt-16 pb-6" showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(600)} className="mb-8">
                    <Text className="text-[#A7A4A0] font-medium text-sm tracking-wider uppercase mb-1">Preferences</Text>
                    <Text className="text-[28px] font-black text-[#F2EFEB]">Settings</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                    <Text className="text-[#A7A4A0] font-bold text-xs uppercase tracking-widest mb-4 ml-1">General</Text>

                    <View className="bg-[#383633] rounded-[24px] border border-[#4E4B47] overflow-hidden mb-8">
                        <TouchableOpacity
                            onPress={() => router.push('/salary-setup')}
                            className="flex-row items-center justify-between p-5 border-b border-[#4E4B47]"
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-[#3E3A35] rounded-full items-center justify-center mr-4 border border-[#5D5A54]">
                                    <Ionicons name="pencil" size={18} color="#D3A77A" />
                                </View>
                                <Text className="text-[#F2EFEB] font-semibold text-base">Edit Salary Setup</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#65625E" />
                        </TouchableOpacity>

                        <View className="flex-row items-center justify-between p-5 border-b border-[#4E4B47]">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-[#3E3A35] rounded-full items-center justify-center mr-4 border border-[#5D5A54]">
                                    <Ionicons name="moon" size={18} color="#D3A77A" />
                                </View>
                                <Text className="text-[#F2EFEB] font-semibold text-base">Dark Mode</Text>
                            </View>
                            <Switch
                                value={isDarkMode}
                                onValueChange={setIsDarkMode}
                                trackColor={{ false: '#4E4B47', true: '#D3A77A' }}
                                thumbColor={isDarkMode ? '#F2EFEB' : '#A7A4A0'}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleResetMonth}
                            className="flex-row items-center justify-between p-5"
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-[#4A2F2F] rounded-full items-center justify-center mr-4 border border-[#663A3A]">
                                    <Ionicons name="refresh" size={18} color="#EF6C6C" />
                                </View>
                                <Text className="text-[#EF6C6C] font-semibold text-base">Reset Month</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    <Text className="text-[#A7A4A0] font-bold text-xs uppercase tracking-widest mb-4 ml-1">About</Text>

                    <View className="bg-[#383633] rounded-[24px] border border-[#4E4B47] overflow-hidden mb-12">
                        <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-[#4E4B47]">
                            <Text className="text-[#F2EFEB] font-medium">Privacy Policy</Text>
                            <Ionicons name="chevron-forward" size={18} color="#65625E" />
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-[#4E4B47]">
                            <Text className="text-[#F2EFEB] font-medium">Terms of Service</Text>
                            <Ionicons name="chevron-forward" size={18} color="#65625E" />
                        </TouchableOpacity>
                        <View className="flex-row items-center justify-between p-5 bg-[#2C2B29]">
                            <Text className="text-[#A7A4A0] font-medium">App Version</Text>
                            <Text className="text-[#65625E] font-bold">1.0.0</Text>
                        </View>
                    </View>
                </Animated.View>
                <View className="h-10" />
            </ScrollView>

            {/* Custom styled dialogs */}
            <ConfirmDialog
                visible={showResetConfirm}
                title="Reset Month"
                message="This will clear all expenses for the current month. Are you sure?"
                confirmText="Reset"
                cancelText="Cancel"
                variant="danger"
                icon="refresh"
                onConfirm={confirmReset}
                onCancel={() => setShowResetConfirm(false)}
            />

            <AlertDialog
                visible={showResetDone}
                title="Done ✅"
                message="All expenses have been cleared successfully."
                buttonText="OK"
                variant="success"
                onClose={() => setShowResetDone(false)}
            />
        </View>
    );
}
