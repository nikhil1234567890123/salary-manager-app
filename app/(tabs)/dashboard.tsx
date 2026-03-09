import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
} from 'react-native-reanimated';
import { useFinance } from '@/context/FinanceContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useImpact } from '@/hooks/useImpact';
import { formatCurrency } from '@/utils/formatters';

// ─── Visual Intelligence Components ──────────────────────────────
import { useFinancialScore } from '@/hooks/useFinancialScore';
import { useSpendingAnalysis } from '@/hooks/useSpendingAnalysis';
import { useFinancialTimeline } from '@/hooks/useFinancialTimeline';
import { useAIBrain } from '@/hooks/useAIBrain';

import FinancialScoreCircle from '@/components/FinancialScoreCircle';
import InsightBubble from '@/components/InsightBubble';
import MoneyCity from '@/components/MoneyCity/MoneyCity';
import RadarChart from '@/components/RadarChart';
import MoneyTimeline from '@/components/MoneyTimeline';

const { width: screenWidth } = Dimensions.get('window');

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    Food: 'fast-food-outline',
    Transport: 'car-outline',
    Shopping: 'bag-outline',
    Bills: 'receipt-outline',
    Health: 'medkit-outline',
    Entertainment: 'game-controller-outline',
    Education: 'school-outline',
    Other: 'ellipsis-horizontal-outline',
    General: 'wallet-outline',
};

export default function DashboardScreen() {
    const router = useRouter();
    const { dashboardData, expenses, transactions, refreshData, deleteExpense, deleteTransaction } = useFinance();
    const impact = useImpact();

    // ─── Hooks ──────────────────────────────────────────────────
    const healthScoreData = useFinancialScore();
    const { universePlanets } = useSpendingAnalysis((screenWidth - 80) / 2 - 35);
    const timelineEvents = useFinancialTimeline();
    const brainSummary = useAIBrain();

    // Deletion state
    const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            refreshData();
        }, [refreshData])
    );

    const data = dashboardData;

    const statCards = [
        {
            label: 'Total Salary',
            value: `₹${formatCurrency(data?.monthlySalary ?? 0)}`,
            icon: 'wallet-outline' as const,
            color: '#D3A77A',
        },
        {
            label: 'Total Spent',
            value: `₹${formatCurrency(data?.totalExpenses ?? 0)}`,
            icon: 'trending-down-outline' as const,
            color: '#EF6C6C',
        },
        {
            label: 'Saved',
            value: `₹${formatCurrency(data?.savings ?? 0)}`,
            icon: 'leaf-outline' as const,
            color: '#6BCB77',
        },
        {
            label: 'Left',
            value: `₹${formatCurrency(data?.remainingBalance ?? 0)}`,
            icon: 'cash-outline' as const,
            color: '#4FC1E8',
        },
    ];

    return (
        <View className="flex-1 bg-[#2C2B29]">
            <StatusBar style="light" />
            <ScrollView className="flex-1 px-6 pt-16 pb-8" showsVerticalScrollIndicator={false}>

                {/* 1. Header & Centerpiece: Financial Health Score */}
                <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-4">
                    <Text className="text-[#A7A4A0] font-medium text-sm tracking-wider uppercase mb-6 self-start">
                        Financial Intelligence
                    </Text>

                    {healthScoreData ? (
                        <FinancialScoreCircle
                            score={healthScoreData.score}
                            label={healthScoreData.label}
                            color={healthScoreData.color}
                            size={220}
                            strokeWidth={18}
                        />
                    ) : (
                        <View className="w-[220px] h-[220px] rounded-full border-4 border-[#383633] items-center justify-center">
                            <Text className="text-[#A7A4A0] font-bold text-sm">Setup salary first</Text>
                        </View>
                    )}
                </Animated.View>

                {/* 2. AI Financial Brain */}
                <InsightBubble summary={brainSummary} />

                {/* 3. Primary Metrics Grid */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)} className="flex-row flex-wrap mb-8 mt-2" style={{ gap: 12 }}>
                    {statCards.map((card, index) => (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => impact.light()}
                            key={card.label}
                            className="bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47]"
                            style={{ width: '47%' }}
                        >
                            <View className="w-9 h-9 bg-[#2C2B29] rounded-xl items-center justify-center mb-3 border border-[#5D5A54]">
                                <Ionicons name={card.icon} size={18} color={card.color} />
                            </View>
                            <Text className="text-[#A7A4A0] font-bold uppercase tracking-wider text-[10px] mb-1">
                                {card.label}
                            </Text>
                            <Text className="text-[#F2EFEB] font-extrabold text-lg">{card.value}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* 4. Money City Visualization */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)} className="bg-[#383633] rounded-[32px] p-5 border border-[#4E4B47] mb-8" style={{ width: screenWidth - 48 }}>
                    <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-6 w-full text-center">
                        Financial Cityscape
                    </Text>

                    <MoneyCity
                        size={screenWidth - 48 - 40}
                    />
                </Animated.View>

                {/* 5. Radar Chart */}
                {healthScoreData && (
                    <Animated.View entering={FadeInDown.duration(600).delay(300)} className="bg-[#383633] rounded-[32px] p-4 py-8 border border-[#4E4B47] mb-8 items-center overflow-hidden">
                        <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-8 w-full text-center">
                            Behavioral Radar
                        </Text>
                        <RadarChart
                            metrics={healthScoreData.metrics}
                            size={screenWidth - 100}
                            onMetricPress={(label) => impact.medium()}
                        />
                    </Animated.View>
                )}

                {/* 6. Financial Timeline */}
                <Animated.View entering={FadeInDown.duration(600).delay(400)} className="mb-8">
                    <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-6 ml-1">
                        Financial Story
                    </Text>
                    <MoneyTimeline events={timelineEvents} />
                </Animated.View>

                {/* Recent Transactions List */}
                <Animated.View entering={FadeInDown.duration(600).delay(500)}>
                    <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-4 ml-1">Recent Activity</Text>
                    {transactions.length === 0 ? (
                        <View className="bg-[#383633] rounded-[24px] p-8 items-center border border-[#4E4B47]">
                            <Ionicons name="receipt-outline" size={36} color="#4E4B47" />
                            <Text className="text-[#65625E] mt-3 font-bold text-sm">No transactions yet</Text>
                        </View>
                    ) : (
                        transactions
                            .slice(0, 5)
                            .map((tx) => (
                                <View
                                    key={tx.id}
                                    className="bg-[#383633] rounded-2xl p-4 mb-3 flex-row items-center border border-[#4E4B47]"
                                >
                                    <View className="w-10 h-10 bg-[#2C2B29] rounded-xl items-center justify-center mr-3 border border-[#5D5A54]">
                                        <Ionicons
                                            name={CATEGORY_ICONS[tx.category] || (tx.type === 'income' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline')}
                                            size={18}
                                            color={tx.type === 'income' ? '#4BFF4B' : '#EF6C6C'}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-[#F2EFEB] text-sm">{tx.category}</Text>
                                        <Text className="text-[#65625E] text-xs mt-0.5">
                                            {tx.note || new Date(tx.date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className={`font-extrabold mr-3 ${tx.type === 'income' ? 'text-[#4BFF4B]' : 'text-[#EF6C6C]'}`}>
                                            {tx.type === 'income' ? '+' : '-'}₹{formatCurrency(tx.amount)}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                impact.medium();
                                                setExpenseToDelete(tx.id);
                                            }}
                                            className="w-8 h-8 items-center justify-center bg-[#4A2F2F]/20 rounded-full"
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#EF6C6C" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                    )}
                </Animated.View>

                <View className="h-24" />
            </ScrollView>

            

            <ConfirmDialog
                visible={!!expenseToDelete}
                title="Delete Transaction?"
                message="This action will permanently remove this transaction."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                icon="trash"
                onConfirm={async () => {
                    if (expenseToDelete) {
                        impact.success();
                        await deleteTransaction(expenseToDelete);
                        setExpenseToDelete(null);
                    }
                }}
                onCancel={() => {
                    impact.light();
                    setExpenseToDelete(null);
                }}
            />
        </View>
    );
}
