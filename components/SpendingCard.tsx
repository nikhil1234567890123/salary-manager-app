import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SpendingCardProps {
    dailySafeSpend: number;
    remainingDays: number;
}

export default function SpendingCard({ dailySafeSpend, remainingDays }: SpendingCardProps) {
    return (
        <View className="bg-white rounded-3xl p-6 shadow-md mb-5 border border-gray-100" style={{ elevation: 3 }}>
            {/* Safe-spend banner */}
            <View className="bg-emerald-50 rounded-2xl p-4 mb-4 flex-row items-center">
                <View className="w-11 h-11 bg-emerald-100 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="shield-checkmark" size={22} color="#059669" />
                </View>
                <View className="flex-1">
                    <Text className="text-emerald-800 text-xs font-bold uppercase tracking-wider mb-0.5">
                        Daily Safe Spend
                    </Text>
                    <Text className="text-emerald-700 text-2xl font-extrabold">
                        ₹{dailySafeSpend.toLocaleString()}
                    </Text>
                </View>
            </View>

            {/* Message */}
            <View className="bg-indigo-50 rounded-2xl p-4 flex-row items-center">
                <View className="w-11 h-11 bg-indigo-100 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="calendar-outline" size={22} color="#4F46E5" />
                </View>
                <View className="flex-1">
                    <Text className="text-indigo-800 text-xs font-bold uppercase tracking-wider mb-0.5">
                        Remaining Days
                    </Text>
                    <Text className="text-indigo-700 text-2xl font-extrabold">
                        {remainingDays} <Text className="text-sm font-semibold text-indigo-400">days left</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
}
