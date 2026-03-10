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
import { useAppTheme } from '@/hooks/useAppTheme';

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
    const theme = useAppTheme();
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
            color: theme.colors.primary,
        },
        {
            label: 'Total Spent',
            value: `₹${formatCurrency(data?.totalExpenses ?? 0)}`,
            icon: 'trending-down-outline' as const,
            color: theme.colors.danger,
        },
        {
            label: 'Saved',
            value: `₹${formatCurrency(data?.savings ?? 0)}`,
            icon: 'leaf-outline' as const,
            color: theme.colors.success,
        },
        {
            label: 'Left',
            value: `₹${formatCurrency(data?.remainingBalance ?? 0)}`,
            icon: 'cash-outline' as const,
            color: theme.colors.accent,
        },
    ];

    return (
        <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
            <StatusBar style={theme.isDark ? "light" : "dark"} />
            <ScrollView className="flex-1 px-6 pt-16 pb-8" showsVerticalScrollIndicator={false}>

                {/* 1. Header & Centerpiece: Financial Health Score */}
                <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-4">
                    <Text className="font-medium text-sm tracking-wider uppercase mb-6 self-start" style={{ color: theme.colors.textSecondary }}>
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
                        <View className="w-[220px] h-[220px] rounded-full border-4 items-center justify-center" style={{ borderColor: theme.colors.border }}>
                            <Text className="font-bold text-sm" style={{ color: theme.colors.textSecondary }}>Setup salary first</Text>
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
                            className="p-5 border"
                            style={{
                                width: '47%',
                                backgroundColor: theme.colors.card,
                                borderColor: theme.colors.border,
                                borderRadius: theme.layout.cardBorderRadius
                            }}
                        >
                            <View className="w-9 h-9 rounded-xl items-center justify-center mb-3 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                                <Ionicons name={card.icon} size={18} color={card.color} />
                            </View>
                            <Text className="font-bold uppercase tracking-wider text-[10px] mb-1" style={{ color: theme.colors.textSecondary }}>
                                {card.label}
                            </Text>
                            <Text className="font-extrabold text-lg" style={{ color: theme.colors.text }}>{card.value}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* 4. Money City Visualization */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)} className="p-5 border mb-8" style={{ width: screenWidth - 48, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderRadius: theme.layout.cardBorderRadius }}>
                    <Text className="text-[10px] font-bold uppercase tracking-widest mb-6 w-full text-center" style={{ color: theme.colors.textSecondary }}>
                        Financial Cityscape
                    </Text>

                    <MoneyCity
                        size={screenWidth - 48 - 40}
                    />
                </Animated.View>

                {/* 5. Radar Chart */}
                {healthScoreData && (
                    <Animated.View entering={FadeInDown.duration(600).delay(300)} className="p-4 py-8 border mb-8 items-center overflow-hidden" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderRadius: theme.layout.cardBorderRadius }}>
                        <Text className="text-xs font-bold uppercase tracking-widest mb-8 w-full text-center" style={{ color: theme.colors.textSecondary }}>
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
                    <Text className="text-xs font-bold uppercase tracking-widest mb-6 ml-1" style={{ color: theme.colors.textSecondary }}>
                        Financial Story
                    </Text>
                    <MoneyTimeline events={timelineEvents} />
                </Animated.View>

                {/* Recent Transactions List */}
                <Animated.View entering={FadeInDown.duration(600).delay(500)}>
                    <Text className="text-xs font-bold uppercase tracking-widest mb-4 ml-1" style={{ color: theme.colors.textSecondary }}>Recent Activity</Text>
                    {transactions.length === 0 ? (
                        <View className="p-8 items-center border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderRadius: theme.layout.cardBorderRadius }}>
                            <Ionicons name="receipt-outline" size={36} color={theme.colors.icon} />
                            <Text className="mt-3 font-bold text-sm" style={{ color: theme.colors.textSecondary }}>No transactions yet</Text>
                        </View>
                    ) : (
                        transactions
                            .slice(0, 5)
                            .map((tx) => (
                                <View
                                    key={tx.id}
                                    className="p-4 mb-3 flex-row items-center border"
                                    style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderRadius: Math.min(theme.layout.cardBorderRadius, 16) }}
                                >
                                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                                        <Ionicons
                                            name={CATEGORY_ICONS[tx.category] || (tx.type === 'income' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline')}
                                            size={18}
                                            color={tx.type === 'income' ? theme.colors.success : theme.colors.danger}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-sm" style={{ color: theme.colors.text }}>{tx.category}</Text>
                                        <Text className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                            {tx.note || new Date(tx.date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className={`font-extrabold mr-3`} style={{ color: tx.type === 'income' ? theme.colors.success : theme.colors.danger }}>
                                            {tx.type === 'income' ? '+' : '-'}₹{formatCurrency(tx.amount)}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                impact.medium();
                                                setExpenseToDelete(tx.id);
                                            }}
                                            className="w-8 h-8 items-center justify-center rounded-full"
                                            style={{ backgroundColor: `${theme.colors.danger}20` }}
                                        >
                                            <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
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
