import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BalanceCardProps {
    monthlySalary: number;
    fixedExpenses: number;
    remainingBalance: number;
    savings: number;
}

export default function BalanceCard({
    monthlySalary,
    fixedExpenses,
    remainingBalance,
    savings,
}: BalanceCardProps) {
    return (
        <View className="bg-indigo-600 rounded-3xl p-6 shadow-xl mb-5" style={{ elevation: 8 }}>
            {/* Top decorative circles */}
            <View className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-indigo-500 opacity-40" />
            <View className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full bg-indigo-700 opacity-30" />

            <Text className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
                Remaining Balance
            </Text>
            <Text className="text-white text-4xl font-extrabold tracking-tight mb-6">
                ₹{remainingBalance.toLocaleString()}
            </Text>

            {/* Info row */}
            <View className="flex-row justify-between">
                <View className="flex-1 items-center">
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="wallet-outline" size={14} color="#c7d2fe" />
                        <Text className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider ml-1">
                            Salary
                        </Text>
                    </View>
                    <Text className="text-white font-bold text-base">
                        ₹{monthlySalary.toLocaleString()}
                    </Text>
                </View>

                <View className="w-px bg-indigo-400 opacity-40 mx-2" />

                <View className="flex-1 items-center">
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="receipt-outline" size={14} color="#c7d2fe" />
                        <Text className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider ml-1">
                            Fixed
                        </Text>
                    </View>
                    <Text className="text-white font-bold text-base">
                        ₹{fixedExpenses.toLocaleString()}
                    </Text>
                </View>

                <View className="w-px bg-indigo-400 opacity-40 mx-2" />

                <View className="flex-1 items-center">
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="leaf-outline" size={14} color="#86efac" />
                        <Text className="text-green-300 text-[10px] font-semibold uppercase tracking-wider ml-1">
                            Savings
                        </Text>
                    </View>
                    <Text className="text-green-300 font-bold text-base">
                        ₹{savings.toLocaleString()}
                    </Text>
                </View>
            </View>
        </View>
    );
}
