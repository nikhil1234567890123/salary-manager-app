import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing
} from 'react-native-reanimated';
import { useFinance } from '@/context/FinanceContext';
import {
    calculateBurnRate,
    predictEndOfMonth,
    getCategoryBreakdown,
    CATEGORY_COLORS, // Moved CATEGORY_COLORS here
} from '@/utils/analyticsEngine';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useImpact } from '@/hooks/useImpact';
import { formatCurrency } from '@/utils/formatters';

const { width: screenWidth } = Dimensions.get('window');

// Category icon map
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

// Sub-components to follow Rules of Hooks
const ChartBar = ({ bar, barHeight, chartAnim }: { bar: any; barHeight: number; chartAnim: any }) => {
    const animatedStyle = useAnimatedStyle(() => ({
        height: `${barHeight * chartAnim.value}%`,
    }));
    return (
        <View className="flex-1 items-center justify-end h-full">
            <Text className="text-[#A7A4A0] text-[9px] font-bold mb-1">
                ₹{bar.value >= 1000 ? `${(bar.value / 1000).toFixed(1)}k` : bar.value}
            </Text>
            <Animated.View
                className="w-full rounded-xl"
                style={[
                    {
                        backgroundColor: bar.color,
                        minHeight: 6,
                    },
                    animatedStyle
                ]}
            />
            <Text className={`text-[#65625E] text-[9px] font-bold mt-2 uppercase`}>{bar.label}</Text>
        </View>
    );
};

const CategorySegment = ({ cat, chartAnim }: { cat: any; chartAnim: any }) => {
    const animatedStyle = useAnimatedStyle(() => ({
        width: `${cat.percentage * chartAnim.value}%`,
    }));
    return (
        <Animated.View
            style={[
                { backgroundColor: CATEGORY_COLORS[cat.category] || '#65625E' },
                animatedStyle
            ]}
        />
    );
};

export default function DashboardScreen() {
    const { dashboardData, expenses, refreshData, isLoading, deleteExpense } = useFinance();
    const impact = useImpact();

    // Chart animations
    const chartAnim = useSharedValue(0);

    // Deletion state
    const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refreshData();

            // Animate charts on focus (only if they are at 0)
            chartAnim.value = withDelay(300, withTiming(1, {
                duration: 1000,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1)
            }));

            return () => {
                // Reset when leaving so it re-animates on return
                chartAnim.value = 0;
            };
        }, [refreshData])
    );

    const data = dashboardData;

    // ─── Analytics ───────────────────────────────────────────
    const spent = data?.totalExpenses ?? 0;
    const dailyLimit = data?.dailySafeSpend ?? 0;
    const spendableMoney = data?.spendableMoney ?? 0;
    const saved = data?.savings ?? 0;

    const burnRate = useMemo(() => calculateBurnRate(spent, dailyLimit), [spent, dailyLimit]);
    const prediction = useMemo(() => predictEndOfMonth(spent, spendableMoney, saved), [spent, spendableMoney, saved]);
    const categories = useMemo(() => getCategoryBreakdown(expenses), [expenses]);

    const statCards = [
        {
            label: 'Total Salary',
            value: `₹${formatCurrency(data?.monthlySalary ?? 0)}`,
            icon: 'wallet-outline' as const,
            color: '#D3A77A',
        },
        {
            label: 'Fixed Outflow',
            value: `₹${formatCurrency(data?.fixedExpenses ?? 0)}`,
            icon: 'home-outline' as const,
            color: '#EACFA7',
        },
        {
            label: 'Total Saved',
            value: `₹${formatCurrency(data?.savings ?? 0)}`,
            icon: 'leaf-outline' as const,
            color: '#6BCB77',
        },
        {
            label: 'Total Spent',
            value: `₹${formatCurrency(data?.totalExpenses ?? 0)}`,
            icon: 'trending-down-outline' as const,
            color: '#EF6C6C',
        },
        {
            label: 'Remaining',
            value: `₹${formatCurrency(data?.remainingBalance ?? 0)}`,
            icon: 'cash-outline' as const,
            color: '#4FC1E8',
        },
    ];

    const total = (data?.monthlySalary ?? 1);
    const bars = [
        { label: 'Fixed', value: data?.fixedExpenses ?? 0, color: '#A87D56' },
        { label: 'Spent', value: data?.totalExpenses ?? 0, color: '#EF6C6C' },
        { label: 'Saved', value: data?.savings ?? 0, color: '#6BCB77' },
        { label: 'Left', value: Math.max(data?.remainingBalance ?? 0, 0), color: '#D3A77A' },
    ];

    return (
        <View className="flex-1 bg-[#2C2B29]">
            <StatusBar style="light" />
            <ScrollView className="flex-1 px-6 pt-16 pb-8" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(600)} className="mb-6">
                    <Text className="text-[#A7A4A0] font-medium text-sm tracking-wider uppercase mb-1">Analytics</Text>
                    <Text className="text-[28px] font-black text-[#F2EFEB]">Dashboard</Text>
                </Animated.View>

                {/* Stats Grid */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)} className="flex-row flex-wrap mb-6" style={{ gap: 12 }}>
                    {statCards.map((card, index) => (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => impact.light()}
                            key={card.label}
                            className="bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47]"
                            style={{
                                width: index === 4 ? '100%' : '47%',
                                alignItems: index === 4 ? 'center' : 'flex-start',
                                flexDirection: index === 4 ? 'row' : 'column'
                            }}
                        >
                            <View className={`w-9 h-9 bg-[#2C2B29] rounded-xl items-center justify-center border border-[#5D5A54] ${index === 4 ? 'mr-4 mb-0' : 'mb-3'}`}>
                                <Ionicons name={card.icon} size={18} color={card.color} />
                            </View>
                            <View className={index === 4 ? "flex-1 flex-row justify-between items-center" : ""}>
                                <Text className={`text-[#A7A4A0] font-bold uppercase tracking-wider ${index === 4 ? 'text-xs' : 'text-[10px] mb-1'}`}>
                                    {card.label}
                                </Text>
                                <Text className={`text-[#F2EFEB] font-extrabold ${index === 4 ? 'text-2xl' : 'text-lg'}`}>{card.value}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* Burn Rate & Prediction */}
                <Animated.View entering={FadeInDown.duration(600).delay(150)} className="flex-row mb-6" style={{ gap: 12 }}>
                    <View className="flex-1 bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47]">
                        <View className="w-8 h-8 rounded-full bg-[#2C2B29] items-center justify-center mb-3 border border-[#5D5A54]">
                            <Ionicons name="flame" size={14} color={burnRate.status === 'safe' ? '#6CEF8A' : burnRate.status === 'warning' ? '#EFA46C' : '#EF6C6C'} />
                        </View>
                        <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Burn Rate</Text>
                        <Text className="text-[#F2EFEB] text-lg font-bold">₹{formatCurrency(burnRate.dailyBurnRate)}/day</Text>
                    </View>
                    <View className="flex-1 bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47]">
                        <View className="w-8 h-8 rounded-full bg-[#2C2B29] items-center justify-center mb-3 border border-[#5D5A54]">
                            <Ionicons name="analytics" size={14} color="#D3A77A" />
                        </View>
                        <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Projected Save</Text>
                        <Text className="text-[#6CEF8A] text-lg font-bold">₹{formatCurrency(prediction.projectedMonthlySavings)}</Text>
                    </View>
                </Animated.View>

                {/* Simple Bar Chart */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)} className="bg-[#383633] rounded-[24px] p-6 border border-[#4E4B47] mb-6">
                    <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-5">Spending Breakdown</Text>
                    <View className="flex-row items-end justify-between" style={{ height: 120, gap: 12 }}>
                        {bars.map((bar, i) => (
                            <ChartBar
                                key={i}
                                bar={bar}
                                barHeight={total > 0 ? Math.max((bar.value / total) * 100, 4) : 4}
                                chartAnim={chartAnim}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Category Breakdown */}
                {categories.length > 0 && (
                    <Animated.View entering={FadeInDown.duration(600).delay(250)} className="bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47] mb-6">
                        <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-4">Category Split</Text>
                        <View className="flex-row h-3 rounded-full overflow-hidden mb-4">
                            {categories.map((cat, i) => (
                                <CategorySegment
                                    key={cat.category}
                                    cat={cat}
                                    chartAnim={chartAnim}
                                />
                            ))}
                        </View>
                        {categories.slice(0, 5).map((cat) => (
                            <View key={cat.category} className="flex-row justify-between items-center mb-2">
                                <View className="flex-row items-center">
                                    <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#65625E' }} />
                                    <Text className="text-[#F2EFEB] text-sm">{cat.category}</Text>
                                </View>
                                <Text className="text-[#A7A4A0] text-sm font-bold">{cat.percentage}%</Text>
                            </View>
                        ))}
                    </Animated.View>
                )}

                {/* Prediction Message */}
                <Animated.View entering={FadeInDown.duration(600).delay(280)} className="bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47] flex-row items-center mb-6">
                    <View className="w-12 h-12 bg-[#2C2B29] rounded-xl items-center justify-center mr-4 border border-[#5D5A54]">
                        <Ionicons name="sparkles" size={20} color="#D3A77A" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Month-End Forecast</Text>
                        <Text className="text-[#F2EFEB] leading-[20px] text-sm">{prediction.message}</Text>
                    </View>
                </Animated.View>

                {/* Recent Expenses */}
                <Animated.View entering={FadeInDown.duration(600).delay(300)}>
                    <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-4 ml-1">Recent Expenses</Text>
                    {expenses.length === 0 ? (
                        <View className="bg-[#383633] rounded-[24px] p-8 items-center border border-[#4E4B47]">
                            <Ionicons name="receipt-outline" size={36} color="#4E4B47" />
                            <Text className="text-[#65625E] mt-3 font-bold text-sm">No expenses yet</Text>
                            <Text className="text-[#4E4B47] text-xs mt-1">Add your first expense to get started</Text>
                        </View>
                    ) : (
                        expenses
                            .slice(-7)
                            .reverse()
                            .map((exp) => (
                                <View
                                    key={exp.id}
                                    className="bg-[#383633] rounded-2xl p-4 mb-3 flex-row items-center border border-[#4E4B47]"
                                >
                                    <View className="w-10 h-10 bg-[#2C2B29] rounded-xl items-center justify-center mr-3 border border-[#5D5A54]">
                                        <Ionicons
                                            name={CATEGORY_ICONS[exp.category] || 'wallet-outline'}
                                            size={18}
                                            color="#D3A77A"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-[#F2EFEB] text-sm">{exp.category}</Text>
                                        <Text className="text-[#65625E] text-xs mt-0.5">
                                            {exp.note || exp.date}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="text-[#EF6C6C] font-extrabold mr-3">-₹{formatCurrency(exp.amount)}</Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                impact.medium();
                                                setExpenseToDelete(exp.id);
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

            {/* Delete Confirmation */}
            <ConfirmDialog
                visible={!!expenseToDelete}
                title="Delete Expense?"
                message="This action will permanently remove this expense and update your balance. Are you sure?"
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                icon="trash"
                onConfirm={async () => {
                    if (expenseToDelete) {
                        impact.success();
                        setIsDeleting(true);
                        await deleteExpense(expenseToDelete);
                        setExpenseToDelete(null);
                        setIsDeleting(false);
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
