import { View, Text, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '@/context/FinanceContext';
import { useImpact } from '@/hooks/useImpact';
import { useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
    useAnimatedScrollHandler
} from "react-native-reanimated";
import { LineChart } from "react-native-chart-kit";
import { PremiumBackground3D } from '@/components/PremiumBackground3D';
import { calculateOverspendDays } from "@/utils/financeCalculations";
import {
    calculateBurnRate,
    predictEndOfMonth,
    calculateDisciplineScore,
    analyzeSpendingBehavior,
    getCategoryBreakdown,
    generateAdvancedInsights,
    getFinancialHealth,
    getSpendingPerformance,
    CATEGORY_COLORS,
} from "@/utils/analyticsEngine";
import { formatCurrency } from "@/utils/formatters";
import { useAppTheme } from '@/hooks/useAppTheme';

const { width } = Dimensions.get("window");


const CategorySegment = ({ cat, index, reportAnim, theme }: { cat: any; index: number, reportAnim: any, theme: any }) => {
    const animatedStyle = useAnimatedStyle(() => ({
        width: `${cat.percentage * reportAnim.value}%`,
    }));
    const opacities = ['FF', 'CC', '99', '66', '33', '1A'];
    const opacity = opacities[index % opacities.length];
    return (
        <Animated.View
            style={[
                { backgroundColor: `${theme.colors.primary}${opacity}` },
                animatedStyle
            ]}
        />
    );
};

export default function ReportScreen() {
    const theme = useAppTheme();
    const { dashboardData, expenses, refreshData } = useFinance();
    const impact = useImpact();

    const reportAnim = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    useFocusEffect(
        useCallback(() => {
            refreshData();

            // Animate on focus (only if at 0)
            reportAnim.value = withDelay(300, withTiming(1, {
                duration: 1000,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1)
            }));

            return () => {
                // Reset when leaving so it re-animates on return
                reportAnim.value = 0;
            };
        }, [refreshData])
    );

    const salary = dashboardData?.monthlySalary ?? 0;
    const spent = dashboardData?.totalExpenses ?? 0;
    const saved = dashboardData?.savings ?? 0;
    const remainingBalance = dashboardData?.remainingBalance ?? 0;
    const dailyLimit = dashboardData?.dailySafeSpend ?? 0;
    const spentToday = dashboardData?.spentToday ?? 0;
    const spendableMoney = dashboardData?.spendableMoney ?? 0;

    // ─── Advanced Analytics ──────────────────────────────────
    const overspendDays = calculateOverspendDays(expenses, dailyLimit);
    const burnRate = useMemo(() => calculateBurnRate(spent, dailyLimit), [spent, dailyLimit]);
    const prediction = useMemo(() => predictEndOfMonth(spent, spendableMoney, saved), [spent, spendableMoney, saved]);
    const discipline = useMemo(() => calculateDisciplineScore(expenses, dailyLimit, salary, spent), [expenses, dailyLimit, salary, spent]);
    const behavior = useMemo(() => analyzeSpendingBehavior(expenses), [expenses]);
    const categories = useMemo(() => getCategoryBreakdown(expenses), [expenses]);
    const insights = useMemo(
        () => generateAdvancedInsights(burnRate, prediction, behavior, categories, discipline, remainingBalance, dailyLimit, spentToday, overspendDays),
        [burnRate, prediction, behavior, categories, discipline, remainingBalance, dailyLimit, spentToday, overspendDays]
    );

    const healthScore = discipline.score;
    const healthMessage = discipline.label;

    // Chart data
    const chartLabels = ["1", "5", "10", "15", "20", "25", "30"];
    const currentDay = new Date().getDate();
    let cumulative = 0;
    const chartData = [0];

    if (expenses.length === 0) {
        chartData.push(0, 0, 0, 0, 0, 0);
    } else {
        const expensesByDay = expenses.reduce<Record<number, number>>((acc, e) => {
            const day = new Date(e.date).getDate();
            acc[day] = (acc[day] || 0) + e.amount;
            return acc;
        }, {});
        for (let i = 2; i <= 30; i += 5) {
            if (i <= currentDay + 4) {
                for (let d = Math.max(1, i - 4); d <= i; d++) {
                    cumulative += (expensesByDay[d] || 0);
                }
                chartData.push(cumulative);
            }
        }
    }

    return (
        <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
            <StatusBar style={theme.isDark ? "light" : "dark"} />

            <PremiumBackground3D scrollY={scrollY} />

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                className="flex-1 px-6 pt-16 pb-6"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(600)} className="mb-6">
                    <View>
                        <Text className="font-medium text-sm tracking-wider uppercase mb-1" style={{ color: theme.colors.textSecondary }}>Analytics</Text>
                        <Text className="text-[28px] font-black" style={{ color: theme.colors.text }}>Financial Health</Text>
                    </View>
                </Animated.View>

                {/* Health Score Card */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)} className="rounded-[28px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] border-[1.5px] mb-8 items-center relative overflow-hidden" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                    <View className="absolute -right-10 -top-10 w-32 h-32 rounded-full" style={{ backgroundColor: theme.colors.primary + '1A' }} />
                    <View className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full" style={{ backgroundColor: theme.colors.primary + '0D' }} />
                    <View className="w-24 h-24 rounded-full border-[3px] items-center justify-center mb-4 shadow-lg" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.primary }}>
                        <Text className="text-4xl font-black" style={{ color: theme.colors.primary }}>{healthScore}</Text>
                    </View>
                    <Text className="font-bold text-lg mb-1" style={{ color: theme.colors.text }}>Score: {healthScore}/100</Text>
                    <Text className="font-medium text-center text-sm" style={{ color: theme.colors.textSecondary }}>{healthMessage}</Text>
                </Animated.View>

                {/* Summary */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    <Text className="font-bold text-xs uppercase tracking-widest mb-4 ml-1" style={{ color: theme.colors.textSecondary }}>Summary</Text>
                    <View className="space-y-3 mb-8">
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => impact.light()}
                            className="rounded-2xl p-4 border flex-row justify-between items-center mb-3"
                            style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-3 border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                                    <Ionicons name="briefcase" size={18} color={theme.colors.primary} />
                                </View>
                                <View>
                                    <Text className="font-medium" style={{ color: theme.colors.text }}>Total Salary</Text>
                                    <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>Monthly Income</Text>
                                </View>
                            </View>
                            <Text className="font-bold text-lg" style={{ color: theme.colors.primary }}>₹ {formatCurrency(salary)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => impact.light()}
                            className="rounded-2xl p-4 border flex-row justify-between items-center mb-3"
                            style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-3 border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                                    <Ionicons name="home" size={18} color={theme.colors.warning} />
                                </View>
                                <View>
                                    <Text className="font-medium" style={{ color: theme.colors.text }}>Fixed Outflow</Text>
                                    <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>Rent, EMI, etc.</Text>
                                </View>
                            </View>
                            <Text className="font-bold text-lg" style={{ color: theme.colors.warning }}>₹ {formatCurrency(dashboardData?.fixedExpenses ?? 0)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => impact.light()}
                            className="rounded-2xl p-4 border flex-row justify-between items-center mb-3"
                            style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-3 border" style={{ backgroundColor: theme.colors.danger + '40', borderColor: theme.colors.danger + '80' }}>
                                    <Ionicons name="trending-down" size={18} color={theme.colors.danger} />
                                </View>
                                <View>
                                    <Text className="font-medium" style={{ color: theme.colors.text }}>Total Spent</Text>
                                    <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>All Expenses</Text>
                                </View>
                            </View>
                            <Text className="font-bold text-lg" style={{ color: theme.colors.danger }}>₹ {formatCurrency(spent)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => impact.light()}
                            className="rounded-2xl p-4 border flex-row justify-between items-center mb-3"
                            style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-3 border" style={{ backgroundColor: theme.colors.success + '40', borderColor: theme.colors.success + '80' }}>
                                    <Ionicons name="trending-up" size={18} color={theme.colors.success} />
                                </View>
                                <View>
                                    <Text className="font-medium" style={{ color: theme.colors.text }}>Currently Saved</Text>
                                    <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>Fixed Savings</Text>
                                </View>
                            </View>
                            <Text className="font-bold text-lg" style={{ color: theme.colors.success }}>₹ {formatCurrency(saved)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => impact.light()}
                            className="rounded-2xl p-4 border flex-row justify-between items-center mb-3"
                            style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-3 border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                                    <Ionicons name="wallet" size={18} color={theme.colors.primary} />
                                </View>
                                <View>
                                    <Text className="font-medium" style={{ color: theme.colors.text }}>Remaining Balance</Text>
                                    <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>Spendable</Text>
                                </View>
                            </View>
                            <Text className="font-bold text-lg" style={{ color: theme.colors.primary }}>₹ {formatCurrency(remainingBalance)}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Burn Rate & Prediction */}
                <Animated.View entering={FadeInDown.duration(600).delay(220)} className="flex-row mb-6" style={{ gap: 12 }}>
                    <View className="flex-1 rounded-[24px] p-5 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                        <View className="w-8 h-8 rounded-full items-center justify-center mb-3 border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                            <Ionicons name="flame" size={14} color={burnRate.status === 'safe' ? theme.colors.success : burnRate.status === 'warning' ? theme.colors.warning : theme.colors.danger} />
                        </View>
                        <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.colors.textSecondary }}>Burn Rate</Text>
                        <Text className="text-lg font-bold" style={{ color: theme.colors.text }}>₹{formatCurrency(burnRate.dailyBurnRate)}/day</Text>
                    </View>
                    <View className="flex-1 rounded-[24px] p-5 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                        <View className="w-8 h-8 rounded-full items-center justify-center mb-3 border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                            <Ionicons name="analytics" size={14} color={theme.colors.primary} />
                        </View>
                        <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.colors.textSecondary }}>Projected Save</Text>
                        <Text className="text-lg font-bold" style={{ color: theme.colors.success }}>₹{formatCurrency(prediction.projectedMonthlySavings)}</Text>
                    </View>
                </Animated.View>

                {/* Category Breakdown */}
                {categories.length > 0 && (
                    <Animated.View entering={FadeInDown.duration(600).delay(240)} className="rounded-[24px] p-5 border mb-6" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                        <Text className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: theme.colors.textSecondary }}>Category Breakdown</Text>
                        <View className="flex-row h-3 rounded-full overflow-hidden mb-4">
                            {categories.map((cat, index) => (
                                <CategorySegment
                                    key={cat.category}
                                    cat={cat}
                                    index={index}
                                    reportAnim={reportAnim}
                                    theme={theme}
                                />
                            ))}
                        </View>
                        {categories.map((cat, index) => {
                            const opacities = ['FF', 'CC', '99', '66', '33', '1A'];
                            const opacity = opacities[index % opacities.length];
                            return (
                                <TouchableOpacity
                                    key={cat.category}
                                    activeOpacity={0.7}
                                    onPress={() => impact.light()}
                                    className="flex-row justify-between items-center mb-2"
                                >
                                    <View className="flex-row items-center">
                                        <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: `${theme.colors.primary}${opacity}` }} />
                                        <Text className="text-sm" style={{ color: theme.colors.text }}>{cat.category}</Text>
                                    </View>
                                    <Text className="text-sm font-bold" style={{ color: theme.colors.textSecondary }}>{cat.percentage}%  ₹{formatCurrency(cat.amount)}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </Animated.View>
                )}

                {/* Spending Progress Chart */}
                <Animated.View entering={FadeInDown.duration(600).delay(250)} className="mb-8">
                    <Text className="font-bold text-xs uppercase tracking-widest mb-4 ml-1" style={{ color: theme.colors.textSecondary }}>Spending Pace</Text>
                    <View className="rounded-[28px] p-5 border overflow-hidden items-center justify-center" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                        <LineChart
                            data={{
                                labels: chartLabels.slice(0, chartData.length),
                                datasets: [{ data: chartData, color: (opacity = 1) => theme.colors.danger, strokeWidth: 3 }]
                            }}
                            width={width - 80}
                            height={180}
                            yAxisLabel="₹"
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: theme.colors.card,
                                backgroundGradientFrom: theme.colors.card,
                                backgroundGradientTo: theme.colors.card,
                                decimalPlaces: 0,
                                color: (opacity = 1) => theme.colors.primary,
                                labelColor: (opacity = 1) => theme.colors.textSecondary,
                                style: { borderRadius: 16 },
                                propsForDots: { r: "4", strokeWidth: "2", stroke: theme.colors.background }
                            }}
                            bezier
                            style={{ marginVertical: 8, borderRadius: 16, marginLeft: -15 }}
                        />
                    </View>
                </Animated.View>

                {/* Spending Behavior */}
                {behavior.totalTransactions > 0 && (
                    <Animated.View entering={FadeInDown.duration(600).delay(270)} className="rounded-[24px] p-5 border mb-6" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                        <Text className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: theme.colors.textSecondary }}>Behavior Analysis</Text>
                        <View className="flex-row justify-between mb-3">
                            <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>Avg Transaction</Text>
                            <Text className="font-bold text-sm" style={{ color: theme.colors.text }}>₹{formatCurrency(behavior.avgTransactionSize)}</Text>
                        </View>
                        <View className="flex-row justify-between mb-3">
                            <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>Total Transactions</Text>
                            <Text className="font-bold text-sm" style={{ color: theme.colors.text }}>{behavior.totalTransactions}</Text>
                        </View>
                        <View className="flex-row justify-between mb-3">
                            <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>Weekday Spending</Text>
                            <Text className="font-bold text-sm" style={{ color: theme.colors.text }}>₹{formatCurrency(behavior.weekdaySpending)}</Text>
                        </View>
                        <View className="flex-row justify-between mb-3">
                            <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>Weekend Spending</Text>
                            <Text className="font-bold text-sm" style={{ color: theme.colors.text }}>₹{formatCurrency(behavior.weekendSpending)}</Text>
                        </View>
                        {behavior.mostExpensiveCategory && (
                            <View className="flex-row justify-between mb-3">
                                <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>Top Category</Text>
                                <Text className="font-bold text-sm" style={{ color: theme.colors.primary }}>{behavior.mostExpensiveCategory.category}</Text>
                            </View>
                        )}
                        {behavior.highestSpendingDay && (
                            <View className="flex-row justify-between">
                                <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>Peak Day</Text>
                                <Text className="font-bold text-sm" style={{ color: theme.colors.danger }}>{behavior.highestSpendingDay.day}  ₹{formatCurrency(behavior.highestSpendingDay.amount)}</Text>
                            </View>
                        )}
                    </Animated.View>
                )}

                {/* Smart Insights */}
                <Animated.View entering={FadeInDown.duration(600).delay(300)}>
                    <Text className="font-bold text-xs uppercase tracking-widest mb-4 ml-1" style={{ color: theme.colors.textSecondary }}>Insights</Text>
                    {insights.map((insight, index) => {
                        const iconColor = insight.type === 'danger' ? theme.colors.danger : insight.type === 'warning' ? theme.colors.warning : insight.type === 'info' ? theme.colors.primary : theme.colors.success;
                        const borderColor = insight.type === 'danger' ? theme.colors.danger + '80' : insight.type === 'warning' ? theme.colors.warning + '80' : insight.type === 'info' ? theme.colors.primary + '80' : theme.colors.success + '80';
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.8}
                                onPress={() => impact.light()}
                                className="rounded-2xl p-5 border flex-row items-start mb-3"
                                style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
                            >
                                <View className={`w-10 h-10 border rounded-full items-center justify-center mr-4 mt-1`} style={{ backgroundColor: iconColor + '1A', borderColor: borderColor }}>
                                    <Ionicons name={insight.icon as any} size={18} color={iconColor} />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold mb-1" style={{ color: theme.colors.text }}>{insight.title}</Text>
                                    <Text className="text-sm leading-5" style={{ color: theme.colors.textSecondary }}>{insight.text}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    {insights.length === 0 && (
                        <Text className="italic ml-1" style={{ color: theme.colors.textSecondary }}>No insights available right now.</Text>
                    )}
                </Animated.View>
                <View className="h-10" />
            </Animated.ScrollView>
        </View>
    );
}
