import { View, Text, ScrollView, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '@/context/FinanceContext';
import { useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LineChart } from "react-native-chart-kit";
import { calculateOverspendDays } from "@/utils/financeCalculations";
import {
    calculateBurnRate,
    predictEndOfMonth,
    calculateDisciplineScore,
    analyzeSpendingBehavior,
    getCategoryBreakdown,
    generateAdvancedInsights,
} from "@/utils/analyticsEngine";
import { formatCurrency } from "@/utils/formatters";

const { width } = Dimensions.get("window");

const CATEGORY_COLORS: Record<string, string> = {
    Food: '#EF6C6C',
    Transport: '#4FC1E8',
    Shopping: '#D3A77A',
    Bills: '#EACFA7',
    Health: '#6BCB77',
    Entertainment: '#C47AE8',
    Education: '#6CB4EF',
    Other: '#A7A4A0',
    General: '#65625E',
};

export default function ReportScreen() {
    const { dashboardData, expenses, refreshData } = useFinance();

    useFocusEffect(
        useCallback(() => {
            refreshData();
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
        <View className="flex-1 bg-[#2C2B29]">
            <StatusBar style="light" />
            <ScrollView className="flex-1 px-6 pt-16 pb-6" showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(600)} className="mb-6">
                    <Text className="text-[#A7A4A0] font-medium text-sm tracking-wider uppercase mb-1">Analytics</Text>
                    <Text className="text-[28px] font-black text-[#F2EFEB]">Financial Health</Text>
                </Animated.View>

                {/* Health Score Card */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)} className="bg-[#383633] rounded-[28px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] border-[1.5px] border-[#4E4B47] mb-8 items-center relative overflow-hidden">
                    <View className="absolute -right-10 -top-10 w-32 h-32 bg-[#D3A77A]/10 rounded-full" />
                    <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#D3A77A]/5 rounded-full" />
                    <View className="w-24 h-24 rounded-full border-[3px] border-[#D3A77A] items-center justify-center mb-4 bg-[#2C2B29] shadow-lg">
                        <Text className="text-4xl font-black text-[#D3A77A]">{healthScore}</Text>
                    </View>
                    <Text className="text-[#F2EFEB] font-bold text-lg mb-1">Score: {healthScore}/100</Text>
                    <Text className="text-[#A7A4A0] font-medium text-center text-sm">{healthMessage}</Text>
                </Animated.View>

                {/* Summary */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    <Text className="text-[#A7A4A0] font-bold text-xs uppercase tracking-widest mb-4 ml-1">Summary</Text>
                    <View className="space-y-3 mb-8">
                        <View className="bg-[#3E3A35] rounded-2xl p-4 border border-[#4E4B47] flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-[#2C2B29] border border-[#5D5A54] rounded-full items-center justify-center mr-3">
                                    <Ionicons name="briefcase" size={18} color="#D3A77A" />
                                </View>
                                <View>
                                    <Text className="text-[#F2EFEB] font-medium">Total Salary</Text>
                                    <Text className="text-[#A7A4A0] text-xs">Monthly Income</Text>
                                </View>
                            </View>
                            <Text className="text-[#D3A77A] font-bold text-lg">₹ {formatCurrency(salary)}</Text>
                        </View>

                        <View className="bg-[#3E3A35] rounded-2xl p-4 border border-[#4E4B47] flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-[#3E3A35] border border-[#5D5A54] rounded-full items-center justify-center mr-3">
                                    <Ionicons name="home" size={18} color="#EACFA7" />
                                </View>
                                <View>
                                    <Text className="text-[#F2EFEB] font-medium">Fixed Outflow</Text>
                                    <Text className="text-[#A7A4A0] text-xs">Rent, EMI, etc.</Text>
                                </View>
                            </View>
                            <Text className="text-[#EACFA7] font-bold text-lg">₹ {formatCurrency(dashboardData?.fixedExpenses ?? 0)}</Text>
                        </View>

                        <View className="bg-[#3E3A35] rounded-2xl p-4 border border-[#4E4B47] flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-[#4A2F2F] border border-[#663A3A] rounded-full items-center justify-center mr-3">
                                    <Ionicons name="trending-down" size={18} color="#EF6C6C" />
                                </View>
                                <View>
                                    <Text className="text-[#F2EFEB] font-medium">Total Spent</Text>
                                    <Text className="text-[#A7A4A0] text-xs">All Expenses</Text>
                                </View>
                            </View>
                            <Text className="text-[#EF6C6C] font-bold text-lg">₹ {formatCurrency(spent)}</Text>
                        </View>

                        <View className="bg-[#3E3A35] rounded-2xl p-4 border border-[#4E4B47] flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-[#2C3B29] border border-[#3A6648] rounded-full items-center justify-center mr-3">
                                    <Ionicons name="trending-up" size={18} color="#6CEF8A" />
                                </View>
                                <View>
                                    <Text className="text-[#F2EFEB] font-medium">Currently Saved</Text>
                                    <Text className="text-[#A7A4A0] text-xs">Fixed Savings</Text>
                                </View>
                            </View>
                            <Text className="text-[#6CEF8A] font-bold text-lg">₹ {formatCurrency(saved)}</Text>
                        </View>

                        <View className="bg-[#3E3A35] rounded-2xl p-4 border border-[#4E4B47] flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-[#2C2B29] border border-[#5D5A54] rounded-full items-center justify-center mr-3">
                                    <Ionicons name="wallet" size={18} color="#EACFA7" />
                                </View>
                                <View>
                                    <Text className="text-[#F2EFEB] font-medium">Remaining Balance</Text>
                                    <Text className="text-[#A7A4A0] text-xs">Spendable</Text>
                                </View>
                            </View>
                            <Text className="text-[#EACFA7] font-bold text-lg">₹ {formatCurrency(remainingBalance)}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Burn Rate & Prediction */}
                <Animated.View entering={FadeInDown.duration(600).delay(220)} className="flex-row mb-6" style={{ gap: 12 }}>
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

                {/* Category Breakdown */}
                {categories.length > 0 && (
                    <Animated.View entering={FadeInDown.duration(600).delay(240)} className="bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47] mb-6">
                        <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-4">Category Breakdown</Text>
                        <View className="flex-row h-3 rounded-full overflow-hidden mb-4">
                            {categories.map((cat) => (
                                <View
                                    key={cat.category}
                                    style={{ width: `${cat.percentage}%`, backgroundColor: CATEGORY_COLORS[cat.category] || '#65625E' }}
                                />
                            ))}
                        </View>
                        {categories.map((cat) => (
                            <View key={cat.category} className="flex-row justify-between items-center mb-2">
                                <View className="flex-row items-center">
                                    <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#65625E' }} />
                                    <Text className="text-[#F2EFEB] text-sm">{cat.category}</Text>
                                </View>
                                <Text className="text-[#A7A4A0] text-sm font-bold">{cat.percentage}%  ₹{formatCurrency(cat.amount)}</Text>
                            </View>
                        ))}
                    </Animated.View>
                )}

                {/* Spending Progress Chart */}
                <Animated.View entering={FadeInDown.duration(600).delay(250)} className="mb-8">
                    <Text className="text-[#A7A4A0] font-bold text-xs uppercase tracking-widest mb-4 ml-1">Spending Pace</Text>
                    <View className="bg-[#383633] rounded-[28px] p-5 border border-[#4E4B47] overflow-hidden items-center justify-center">
                        <LineChart
                            data={{
                                labels: chartLabels.slice(0, chartData.length),
                                datasets: [{ data: chartData, color: (opacity = 1) => `rgba(239, 108, 108, ${opacity})`, strokeWidth: 3 }]
                            }}
                            width={width - 80}
                            height={180}
                            yAxisLabel="₹"
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: "#383633",
                                backgroundGradientFrom: "#383633",
                                backgroundGradientTo: "#383633",
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(211, 167, 122, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(167, 164, 160, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: { r: "4", strokeWidth: "2", stroke: "#2C2B29" }
                            }}
                            bezier
                            style={{ marginVertical: 8, borderRadius: 16, marginLeft: -15 }}
                        />
                    </View>
                </Animated.View>

                {/* Spending Behavior */}
                {behavior.totalTransactions > 0 && (
                    <Animated.View entering={FadeInDown.duration(600).delay(270)} className="bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47] mb-6">
                        <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-4">Behavior Analysis</Text>
                        <View className="flex-row justify-between mb-3">
                            <Text className="text-[#A7A4A0] text-xs">Avg Transaction</Text>
                            <Text className="text-[#F2EFEB] font-bold text-sm">₹{formatCurrency(behavior.avgTransactionSize)}</Text>
                        </View>
                        <View className="flex-row justify-between mb-3">
                            <Text className="text-[#A7A4A0] text-xs">Total Transactions</Text>
                            <Text className="text-[#F2EFEB] font-bold text-sm">{behavior.totalTransactions}</Text>
                        </View>
                        <View className="flex-row justify-between mb-3">
                            <Text className="text-[#A7A4A0] text-xs">Weekday Spending</Text>
                            <Text className="text-[#F2EFEB] font-bold text-sm">₹{formatCurrency(behavior.weekdaySpending)}</Text>
                        </View>
                        <View className="flex-row justify-between mb-3">
                            <Text className="text-[#A7A4A0] text-xs">Weekend Spending</Text>
                            <Text className="text-[#F2EFEB] font-bold text-sm">₹{formatCurrency(behavior.weekendSpending)}</Text>
                        </View>
                        {behavior.mostExpensiveCategory && (
                            <View className="flex-row justify-between mb-3">
                                <Text className="text-[#A7A4A0] text-xs">Top Category</Text>
                                <Text className="text-[#D3A77A] font-bold text-sm">{behavior.mostExpensiveCategory.category}</Text>
                            </View>
                        )}
                        {behavior.highestSpendingDay && (
                            <View className="flex-row justify-between">
                                <Text className="text-[#A7A4A0] text-xs">Peak Day</Text>
                                <Text className="text-[#EF6C6C] font-bold text-sm">{behavior.highestSpendingDay.day}  ₹{formatCurrency(behavior.highestSpendingDay.amount)}</Text>
                            </View>
                        )}
                    </Animated.View>
                )}

                {/* Smart Insights */}
                <Animated.View entering={FadeInDown.duration(600).delay(300)}>
                    <Text className="text-[#A7A4A0] font-bold text-xs uppercase tracking-widest mb-4 ml-1">Insights</Text>
                    {insights.map((insight, index) => {
                        const iconColor = insight.type === 'danger' ? '#EF6C6C' : insight.type === 'warning' ? '#EFA46C' : insight.type === 'info' ? '#4FC1E8' : '#6CEF8A';
                        const bgColor = insight.type === 'danger' ? 'bg-[#4A2F2F]' : insight.type === 'warning' ? 'bg-[#4A3F2F]' : insight.type === 'info' ? 'bg-[#2F3A4A]' : 'bg-[#2C3B29]';
                        const borderColor = insight.type === 'danger' ? 'border-[#663A3A]' : insight.type === 'warning' ? 'border-[#665A3A]' : insight.type === 'info' ? 'border-[#3A5266]' : 'border-[#3A6648]';
                        return (
                            <View key={index} className="bg-[#3E3A35] rounded-2xl p-5 border border-[#4E4B47] flex-row items-start mb-3">
                                <View className={`w-10 h-10 ${bgColor} border ${borderColor} rounded-full items-center justify-center mr-4 mt-1`}>
                                    <Ionicons name={insight.icon as any} size={18} color={iconColor} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[#F2EFEB] font-bold mb-1">{insight.title}</Text>
                                    <Text className="text-[#A7A4A0] text-sm leading-5">{insight.text}</Text>
                                </View>
                            </View>
                        );
                    })}
                    {insights.length === 0 && (
                        <Text className="text-[#A7A4A0] italic ml-1">No insights available right now.</Text>
                    )}
                </Animated.View>
                <View className="h-10" />
            </ScrollView>
        </View>
    );
}
