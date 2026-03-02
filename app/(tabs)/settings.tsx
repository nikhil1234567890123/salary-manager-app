import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from "react";

export default function SettingsScreen() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 px-6 pt-16 pb-6">
                <Text className="text-2xl font-bold text-slate-900 mb-6">Settings</Text>

                <View className="bg-white rounded-2xl shadow-sm shadow-slate-100 border border-slate-100 overflow-hidden mb-6">
                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-slate-100">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mr-3">
                                <IconSymbol name="pencil" size={16} color="#4f46e5" />
                            </View>
                            <Text className="text-slate-700 font-medium text-base">Edit Salary Setup</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={16} color="#94a3b8" />
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center mr-3">
                                <IconSymbol name="moon.fill" size={16} color="#64748b" />
                            </View>
                            <Text className="text-slate-700 font-medium text-base">Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={setIsDarkMode}
                            trackColor={{ false: '#cbd5e1', true: '#818cf8' }}
                            thumbColor={isDarkMode ? '#4f46e5' : '#f8fafc'}
                        />
                    </View>

                    <TouchableOpacity className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-red-50 rounded-full items-center justify-center mr-3">
                                <IconSymbol name="arrow.clockwise" size={16} color="#ef4444" />
                            </View>
                            <Text className="text-red-600 font-medium text-base">Reset Month</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider ml-2">About</Text>

                <View className="bg-white rounded-2xl shadow-sm shadow-slate-100 border border-slate-100 overflow-hidden">
                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-slate-100">
                        <Text className="text-slate-700 font-medium">Privacy Policy</Text>
                        <IconSymbol name="chevron.right" size={16} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-slate-100">
                        <Text className="text-slate-700 font-medium">Terms of Service</Text>
                        <IconSymbol name="chevron.right" size={16} color="#94a3b8" />
                    </TouchableOpacity>
                    <View className="flex-row items-center justify-between p-4 bg-slate-50">
                        <Text className="text-slate-500 font-medium">App Version</Text>
                        <Text className="text-slate-400">1.0.0</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
