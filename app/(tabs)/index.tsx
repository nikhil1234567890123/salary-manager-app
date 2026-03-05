import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useFocusEffect } from "expo-router";
import { useState, useCallback, useMemo } from "react";
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useFinance } from '@/context/FinanceContext';
import {
  predictEndOfMonth,
  getWeeklySpendingTrend,
  getLatestExpenseToday,
  getHomeInsight,
  getUsageColor,
} from '@/utils/analyticsEngine';
import { formatCurrency } from '@/utils/formatters';

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const { salary, dashboardData, expenses, setSalaryConfig, refreshData } = useFinance();

  // Salary setup form state
  const [salaryInput, setSalaryInput] = useState('');
  const [fixedInput, setFixedInput] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  // Background animation
  const bgAnim = useSharedValue(0);
  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bgAnim.value }],
  }));

  useFocusEffect(
    useCallback(() => {
      refreshData();
      bgAnim.value = withRepeat(
        withSequence(
          withTiming(-15, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
          withTiming(10, { duration: 8000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }, [refreshData])
  );

  const handleSaveSalary = async () => {
    const salaryNum = parseFloat(salaryInput);
    const fixedNum = parseFloat(fixedInput) || 0;
    if (!salaryNum || salaryNum <= 0) return;

    await setSalaryConfig({
      monthlySalary: salaryNum,
      fixedExpenses: fixedNum,
      savingsRate: 0.2, // Default 20%
    });
    setShowSetup(false);
  };

  const data = dashboardData;
  const hasSalary = salary !== null && salary.monthlySalary > 0;

  // ─── Smart Data (all logic from analyticsEngine) ───────────
  const spent = data?.totalExpenses ?? 0;
  const spendable = data?.spendableMoney ?? 0;
  const savedTarget = data?.savings ?? 0;
  const dailyLimit = data?.dailySafeSpend ?? 0;
  const spentToday = data?.spentToday ?? 0;
  const remainingDays = data?.remainingDays ?? 0;
  const remainingBalance = data?.remainingBalance ?? 0;

  // 1. Monthly usage
  const usagePercent = spendable > 0 ? Math.round((spent / spendable) * 100) : 0;
  const usageColor = getUsageColor(usagePercent);

  // 2. Daily spending status
  const isOverDailyLimit = spentToday > dailyLimit && dailyLimit > 0;
  const dailyStatusText = isOverDailyLimit
    ? "Warning: Today's spending exceeds the safe limit."
    : spentToday > 0
      ? "You're within your safe spending limit today."
      : "No spending yet today — nice!";

  // 3. Latest expense today
  const latestExpense = useMemo(() => getLatestExpenseToday(expenses), [expenses]);

  // 4. Smart prediction
  const prediction = useMemo(() => predictEndOfMonth(spent, spendable, savedTarget), [spent, spendable, savedTarget]);

  // 5. Weekly trend
  const weeklyTrend = useMemo(() => getWeeklySpendingTrend(expenses), [expenses]);
  const weekMax = Math.max(...weeklyTrend.map(d => d.amount), 1);

  // 6. Home insight
  const homeInsight = useMemo(() => getHomeInsight(expenses, dailyLimit), [expenses, dailyLimit]);

  return (
    <View className="flex-1 bg-[#2C2B29]">
      <StatusBar style="light" />

      {/* Subtle Background */}
      <View className="absolute inset-0 overflow-hidden">
        <Animated.View
          style={[bgStyle, { width: height, height: height, borderRadius: height / 2 }]}
          className="absolute -top-[20%] -right-[40%] bg-[#D3A77A] opacity-[0.06]"
        />
      </View>

      <ScrollView className="flex-1 px-6 pt-16 pb-24 z-10" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-[#A7A4A0] font-medium text-sm tracking-wider uppercase mb-1">Overview</Text>
            <Text className="text-[28px] font-black text-[#F2EFEB]">Salary Manager</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowSetup(!showSetup)}
            className="w-12 h-12 bg-[#3E3A35] rounded-full items-center justify-center border border-[#5D5A54]"
          >
            <Ionicons name="settings-outline" size={20} color="#D3A77A" />
          </TouchableOpacity>
        </Animated.View>

        {/* Temporary Testing Row */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} className="flex-row mb-6" style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={() => {
              const { triggerExpenseDetected } = require('@/services/notificationService');
              triggerExpenseDetected(250, "Swiggy");
            }}
            className="flex-1 bg-[#3E3A35] py-3 rounded-xl items-center border border-[#5D5A54]"
          >
            <Text className="text-[#D3A77A] font-bold text-xs uppercase tracking-widest">Test Instant</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const { testDelayedNotification } = require('@/services/notificationService');
              testDelayedNotification();
            }}
            className="flex-1 bg-[#3E3A35] py-3 rounded-xl items-center border border-[#5D5A54]"
          >
            <Text className="text-[#D3A77A] font-bold text-xs uppercase tracking-widest">Test 5s Delay</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Salary Setup (inline, collapsible) */}
        {(showSetup || !hasSalary) && (
          <Animated.View entering={FadeInDown.duration(500)} className="bg-[#383633] rounded-[28px] p-6 mb-6 border border-[#4E4B47] shadow-lg shadow-black/40">
            <Text className="text-[#D3A77A] font-bold text-xs uppercase tracking-widest mb-5">
              {hasSalary ? '✏️  Edit Salary Config' : '⚡  Quick Setup'}
            </Text>

            {/* Monthly Salary */}
            <View className="mb-4">
              <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-2 ml-1">Monthly Salary</Text>
              <View className="flex-row items-center bg-[#2C2B29] rounded-2xl px-4 py-4 border border-[#4E4B47]">
                <Ionicons name="wallet-outline" size={18} color="#A7A4A0" />
                <Text className="text-[#A87D56] font-bold text-lg ml-2 mr-1">₹</Text>
                <TextInput
                  className="flex-1 text-[#F2EFEB] text-lg font-bold p-0"
                  placeholder="50000"
                  placeholderTextColor="#65625E"
                  keyboardType="numeric"
                  value={salaryInput}
                  onChangeText={setSalaryInput}
                  selectionColor="#EACFA7"
                />
              </View>
            </View>

            {/* Fixed Expenses */}
            <View className="mb-5">
              <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-2 ml-1">Fixed Expenses (Rent, EMI, etc)</Text>
              <View className="flex-row items-center bg-[#2C2B29] rounded-2xl px-4 py-4 border border-[#4E4B47]">
                <Ionicons name="home-outline" size={18} color="#A7A4A0" />
                <Text className="text-[#A87D56] font-bold text-lg ml-2 mr-1">₹</Text>
                <TextInput
                  className="flex-1 text-[#F2EFEB] text-lg font-bold p-0"
                  placeholder="15000"
                  placeholderTextColor="#65625E"
                  keyboardType="numeric"
                  value={fixedInput}
                  onChangeText={setFixedInput}
                  selectionColor="#EACFA7"
                />
              </View>
            </View>

            {/* Info */}
            <View className="flex-row items-center mb-5 bg-[#2C2B29] rounded-xl px-4 py-3 border border-[#4E4B47]">
              <Ionicons name="information-circle-outline" size={16} color="#A7A4A0" />
              <Text className="text-[#A7A4A0] text-xs ml-2 flex-1">Savings are automatically set to 20% of your salary.</Text>
            </View>

            <TouchableOpacity
              onPress={handleSaveSalary}
              className="rounded-full shadow-lg shadow-black/50"
              style={{ elevation: 10 }}
              activeOpacity={0.8}
            >
              <View className="py-4 rounded-full items-center justify-center flex-row bg-[#D1A677] border-t border-t-[#EACFA7] border-b border-b-[#A87D56]">
                <Ionicons name="checkmark-done" size={18} color="#2B231A" />
                <Text className="text-[#2B231A] font-extrabold text-sm tracking-wide ml-2">Save Config</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Main Balance Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} className="bg-[#383633] rounded-[28px] p-7 shadow-[0_20px_40px_rgba(0,0,0,0.5)] border-[1.5px] border-[#4E4B47] mb-6 relative overflow-hidden">
          <View className="absolute -right-8 -top-8 w-32 h-32 bg-[#D3A77A]/10 rounded-full" />
          <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#D3A77A]/5 rounded-full" />

          <Text className="text-[#A7A4A0] font-semibold text-xs tracking-widest uppercase mb-2">Remaining Balance</Text>
          <Text className="text-[42px] font-black text-[#D3A77A] mb-6 tracking-tighter">
            <Text className="text-3xl text-[#A87D56]">₹</Text>
            {formatCurrency(data?.remainingBalance ?? 0)}
          </Text>

          {/* Progress bar — enhanced with usage text and dynamic color */}
          <View className="bg-[#2C2B29]/60 rounded-2xl p-4 border border-[#4A4845]">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-[#A7A4A0] font-medium text-xs uppercase tracking-wider">Monthly Usage</Text>
              <Text className="text-[#F2EFEB] font-bold text-sm">
                {usagePercent}%
              </Text>
            </View>
            {/* Usage context line */}
            <Text className="text-[#65625E] text-[10px] font-bold mb-2">
              ₹{formatCurrency(spent)} of ₹{formatCurrency(spendable)} used
            </Text>
            <View className="h-[6px] bg-[#3E3A35] rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(usagePercent, 100)}%`,
                  backgroundColor: usageColor,
                }}
              />
            </View>
          </View>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)} className="flex-row justify-between mb-6" style={{ gap: 12 }}>
          <View className="flex-1 bg-[#3E3A35] rounded-[24px] p-5 border border-[#4E4B47]">
            <View className="w-8 h-8 rounded-full bg-[#2C2B29] items-center justify-center mb-3 border border-[#5D5A54]">
              <Ionicons name="shield-checkmark" size={14} color="#D3A77A" />
            </View>
            <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Daily Safe Spend</Text>
            <Text className="text-xl font-bold text-[#F2EFEB]">₹{formatCurrency(data?.dailySafeSpend ?? 0)}</Text>
            {/* Daily status context */}
            <Text className="text-[#65625E] text-[9px] mt-2 leading-[12px]">{dailyStatusText}</Text>
          </View>

          <View className={`flex-1 rounded-[24px] p-5 border ${isOverDailyLimit
            ? 'bg-[#4A2F2F] border-[#663A3A]'
            : 'bg-[#3E3A35] border-[#4E4B47]'
            }`}>
            <View className={`w-8 h-8 rounded-full items-center justify-center mb-3 border ${isOverDailyLimit
              ? 'bg-[#382020] border-[#5C2B2B]'
              : 'bg-[#2C2B29] border-[#5D5A54]'
              }`}>
              <Ionicons
                name={isOverDailyLimit ? "warning" : "trending-down"}
                size={14}
                color={isOverDailyLimit ? "#EF6C6C" : "#D3A77A"}
              />
            </View>
            <Text className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isOverDailyLimit ? 'text-[#EF6C6C]' : 'text-[#D3A77A]'}`}>Spent Today</Text>
            <Text className={`text-xl font-bold ${isOverDailyLimit ? 'text-[#FFE5E5]' : 'text-[#F2EFEB]'}`}>₹{formatCurrency(spentToday)}</Text>
            {/* Latest expense context */}
            <Text className="text-[#65625E] text-[9px] mt-2 leading-[12px]">
              {latestExpense
                ? `Last: ${latestExpense.note || latestExpense.category} ₹${formatCurrency(latestExpense.amount)}`
                : 'No expenses recorded today.'}
            </Text>
          </View>
        </Animated.View>

        {/* Savings Projection — enhanced with analytics engine */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)} className="bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47] flex-row items-center mb-6">
          <View className="w-12 h-12 bg-[#2C2B29] rounded-xl items-center justify-center mr-4 border border-[#5D5A54]">
            <Ionicons name="sparkles" size={20} color="#D3A77A" />
          </View>
          <View className="flex-1">
            <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Smart Projection</Text>
            <Text className="text-[#F2EFEB] leading-[20px] text-sm">{prediction.message}</Text>
          </View>
        </Animated.View>

        {/* Remaining Days Card — enhanced with safe spend info */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)} className="bg-[#3E3A35] rounded-[24px] p-5 border border-[#4E4B47] flex-row items-center mb-6">
          <View className="w-12 h-12 bg-[#2C2B29] rounded-xl items-center justify-center mr-4 border border-[#5D5A54]">
            <Ionicons name="calendar-outline" size={20} color="#A7A4A0" />
          </View>
          <View className="flex-1">
            <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Remaining Days</Text>
            <Text className="text-[#F2EFEB] text-lg font-bold">{remainingDays} days left</Text>
            <Text className="text-[#65625E] text-[10px] mt-1">Safe spending available: ₹{formatCurrency(dailyLimit)}/day</Text>
          </View>
        </Animated.View>

        {/* Weekly Spending Trend */}
        <Animated.View entering={FadeInDown.duration(600).delay(450)} className="bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47] mb-6">
          <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-4">Last 7 Days</Text>
          <View className="flex-row items-end justify-between" style={{ height: 48, gap: 6 }}>
            {weeklyTrend.map((day, i) => {
              const barH = weekMax > 0 ? Math.max((day.amount / weekMax) * 100, 4) : 4;
              const isToday = i === 6;
              return (
                <View key={i} className="flex-1 items-center">
                  <View
                    className="w-full rounded-md"
                    style={{
                      height: `${barH}%`,
                      backgroundColor: isToday ? '#D3A77A' : '#4E4B47',
                      minHeight: 3,
                    }}
                  />
                  <Text className={`text-[8px] font-bold mt-1 ${isToday ? 'text-[#D3A77A]' : 'text-[#65625E]'}`}>{day.label}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Spending Insight Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)} className="bg-[#3E3A35] rounded-[24px] p-5 border border-[#4E4B47] flex-row items-center">
          <View className="w-12 h-12 bg-[#2C2B29] rounded-xl items-center justify-center mr-4 border border-[#5D5A54]">
            <Ionicons name="bulb-outline" size={20} color="#EACFA7" />
          </View>
          <View className="flex-1">
            <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Insight</Text>
            <Text className="text-[#F2EFEB] text-sm leading-[20px]">{homeInsight}</Text>
          </View>
        </Animated.View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
