import { View, Text, TouchableOpacity, RefreshControl, Modal, TextInput, ScrollView, Dimensions, LayoutAnimation, Platform, UIManager, Alert } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useExpenseDetection } from '@/hooks/useExpenseDetection';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useState, useCallback, useMemo, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeInDown,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeOutLeft,
  Layout,
} from "react-native-reanimated";
import { useFinance } from '@/context/FinanceContext';
import { useImpact } from '@/hooks/useImpact';
import {
  predictEndOfMonth,
  getWeeklySpendingTrend,
  getLatestExpenseToday,
  getHomeInsight,
  getUsageColor,
} from '@/utils/analyticsEngine';
import { formatCurrency } from '@/utils/formatters';
import { SafeAreaView } from "react-native-safe-area-context";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height } = Dimensions.get('window');

// Sub-component for individual animated bars to follow Rules of Hooks
const WeeklyBar = ({ barH, weeklyAnim, isToday, label }: { barH: number; weeklyAnim: any; isToday: boolean; label: string }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    height: `${barH * weeklyAnim.value}%`,
  }));

  return (
    <View className="flex-1 items-center">
      <Animated.View
        className="w-full rounded-md"
        style={[
          {
            backgroundColor: isToday ? '#D3A77A' : '#4E4B47',
            minHeight: 3,
          },
          animatedStyle,
        ]}
      />
      <Text className={`text-[8px] font-bold mt-1 ${isToday ? 'text-[#D3A77A]' : 'text-[#65625E]'}`}>{label}</Text>
    </View>
  );
};

export default function HomeScreen() {
  const { salary, dashboardData, expenses, setSalaryConfig, refreshData } = useFinance();

  const {
    detectedTransactions,
    isScanning,
    triggerScan,
    simulateSms,
    confirmTransaction,
    dismissTransaction
  } = useExpenseDetection();

  const impact = useImpact();

  // Salary setup form state
  const [salaryInput, setSalaryInput] = useState('');
  const [fixedInput, setFixedInput] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pasteModalVisible, setPasteModalVisible] = useState(false);
  const [pastedSms, setPastedSms] = useState('');

  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  // Background & UI Animations
  const weeklyAnim = useSharedValue(0);
  const bgAnim = useSharedValue(0);
  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bgAnim.value }],
  }));

  // Progress bar animation
  const progressWidth = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Balance card scale animation
  const cardScale = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleCardPressIn = () => {
    cardScale.value = withTiming(0.96, { duration: 100 });
  };

  const handleCardPressOut = () => {
    cardScale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const data = dashboardData;
  const spent = data?.totalExpenses ?? 0;
  const spendable = data?.spendableMoney ?? 0;

  // 1. Monthly usage (Moved up for use in animations)
  const usagePercent = spendable > 0 ? Math.round((spent / spendable) * 100) : 0;
  const usageColor = getUsageColor(usagePercent);

  // 1. Initial growth & screen-focus logic
  useFocusEffect(
    useCallback(() => {
      refreshData();

      // Start background floating animation
      bgAnim.value = withRepeat(
        withSequence(
          withTiming(-15, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
          withTiming(10, { duration: 8000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      // Trigger entry growth animations from 0
      if (progressWidth.value === 0) {
        progressWidth.value = withTiming(Math.min(usagePercent, 100), {
          duration: 1200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }

      if (weeklyAnim.value === 0) {
        weeklyAnim.value = withDelay(400, withTiming(1, {
          duration: 1000,
          easing: Easing.out(Easing.exp)
        }));
      }

      return () => {
        // Reset values when leaving the tab
        progressWidth.value = 0;
        weeklyAnim.value = 0;
      };
    }, [refreshData]) // Stable dependencies
  );

  // 2. Smoothly animate updates while user is on screen (no zero-reset)
  useEffect(() => {
    progressWidth.value = withTiming(Math.min(usagePercent, 100), {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [usagePercent]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  }, [refreshData]);

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

  const hasSalary = salary !== null && salary.monthlySalary > 0;

  // ─── Smart Data ───────────────────────────────────────────
  // spent and spendable moved up
  const savedTarget = data?.savings ?? 0;
  const dailyLimit = data?.dailySafeSpend ?? 0;
  const spentToday = data?.spentToday ?? 0;
  const remainingDays = data?.remainingDays ?? 0;

  // usagePercent and usageColor moved up

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
    <SafeAreaView className="flex-1 bg-[#2C2B29]" edges={['top']}>
      <StatusBar style="light" />

      {/* Subtle Background */}
      <View className="absolute inset-0 overflow-hidden">
        <Animated.View
          style={[bgStyle, { width: height, height: height, borderRadius: height / 2 }]}
          className="absolute -top-[20%] -right-[40%] bg-[#D3A77A] opacity-[0.06]"
        />
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#D3A77A"
          />
        }
      >
        {/* Simulation Mode Banner (Expo Go only) */}
        {isExpoGo && (
          <Animated.View
            entering={FadeInDown.delay(400).duration(800)}
            className="mb-6 mt-4 bg-[#3E3A35] border border-[#D3A77A]/30 rounded-2xl p-4 overflow-hidden"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-[#D3A77A]/20 items-center justify-center mr-3">
                <Ionicons name="flask-outline" size={18} color="#D3A77A" />
              </View>
              <Text className="text-[#D3A77A] font-bold text-sm tracking-wide">SIMULATION MODE</Text>
            </View>

            <Text className="text-[#A7A4A0] text-xs leading-[18px] mb-4">
              Expo Go cannot read real SMS. Copy your bank SMS and paste it below to test "Auto-Detection".
            </Text>

            <TouchableOpacity
              onPress={() => {
                impact.medium();
                setPasteModalVisible(true);
              }}
              activeOpacity={0.8}
              className="flex-row items-center bg-[#D3A77A]/10 border border-[#D3A77A] py-3 px-5 rounded-2xl"
            >
              <Ionicons name="clipboard-outline" size={18} color="#D3A77A" />
              <Text className="text-[#D3A77A] font-bold text-sm ml-2">PASTE BANK SMS</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} className="flex-row justify-between items-center mb-8 mt-6">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-[#3E3A35] rounded-xl items-center justify-center mr-3 border border-[#D3A77A]/30 overflow-hidden shadow-lg shadow-[#D3A77A]/10">
              <Image
                source={require("../../assets/images/app_logo_fixed.png")}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
            <View>
              <Text className="text-[#A7A4A0] font-medium text-xs tracking-widest uppercase mb-0.5">Overview</Text>
              <Text className="text-2xl font-black text-[#F2EFEB]">Salary Manager</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              impact.light();
              setShowSetup(!showSetup);
            }}
            className="w-12 h-12 bg-[#3E3A35] rounded-full items-center justify-center border border-[#5D5A54]"
          >
            <Ionicons name="settings-outline" size={20} color="#D3A77A" />
          </TouchableOpacity>
        </Animated.View>

        {/* Background AI Status */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} className="flex-row mb-6" style={{ gap: 10 }}>
          <View className="flex-1 bg-[#3E3A35]/50 px-4 py-4 rounded-2xl border border-[#4E4B47] flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#2C2B29] items-center justify-center mr-3 border border-[#5D5A54]/50">
              <Ionicons name="scan-outline" size={18} color="#D3A77A" />
            </View>
            <View className="flex-1">
              <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Background AI</Text>
              <Text className="text-[#F2EFEB] text-xs font-bold">Auto-Entry Active</Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                impact.medium();
                const count = await triggerScan();
                if (count > 0) {
                  Alert.alert("Scan Complete", `Successfully found ${count} new transactions from your SMS!`);
                } else {
                  Alert.alert("No Transactions Found", "We checked your recent SMS but didn't find any new bank debit messages.");
                }
              }}
              className="bg-[#D3A77A] px-3 py-2 rounded-lg"
            >
              <Text className="text-[#2B231A] font-bold text-[10px] uppercase">Scan Now</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Pending Transactions (from SMS) */}
        {detectedTransactions.length > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4 px-1">
              <Text className="text-[#D3A77A] font-bold text-xs uppercase tracking-widest">
                Pending Confirmation ({detectedTransactions.length})
              </Text>
            </View>

            {detectedTransactions.map((tx, idx) => (
              <Animated.View
                key={tx.id}
                entering={FadeInDown.delay(100 * idx)}
                exiting={FadeOutLeft.duration(300)}
                layout={Layout.springify()}
                className="bg-[#3E3A35] rounded-2xl p-4 border border-[#D3A77A]/40 mb-3 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <View className="w-2 h-2 rounded-full bg-[#D3A77A] mr-2" />
                      <Text className="text-[#F2EFEB] font-bold text-sm" numberOfLines={1}>
                        {tx.merchant}
                      </Text>
                    </View>
                    <Text className="text-[#A7A4A0] text-[10px] font-medium uppercase tracking-tighter">
                      {tx.category} • {tx.date}
                    </Text>
                  </View>
                  <Text className="text-[#D3A77A] font-black text-lg">
                    ₹{formatCurrency(tx.amount)}
                  </Text>
                </View>

                <View className="flex-row" style={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={async () => {
                      impact.success();
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      await confirmTransaction(tx);
                    }}
                    className="flex-1 bg-[#D3A77A] py-2.5 rounded-xl items-center"
                  >
                    <Text className="text-[#2B231A] font-bold text-xs">CONFIRM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      impact.light();
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      await dismissTransaction(tx);
                    }}
                    className="bg-[#2C2B29] px-4 py-2.5 rounded-xl items-center border border-[#4E4B47]"
                  >
                    <Ionicons name="trash-outline" size={16} color="#A7A4A0" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Main Balance Card */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={cardStyle}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={handleCardPressIn}
            onPressOut={handleCardPressOut}
            onPress={() => impact.light()}
            className="bg-[#383633] rounded-[28px] p-7 shadow-lg border border-[#4E4B47] mb-6 relative overflow-hidden"
          >
            <View className="absolute -right-8 -top-8 w-32 h-32 bg-[#D3A77A]/10 rounded-full" />
            <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#D3A77A]/5 rounded-full" />

            <Text className="text-[#A7A4A0] font-semibold text-xs tracking-widest uppercase mb-2">Remaining Balance</Text>
            <Text className="text-[42px] font-black text-[#D3A77A] mb-6 tracking-tighter">
              <Text className="text-3xl text-[#A87D56]">₹</Text>
              {formatCurrency(data?.remainingBalance ?? 0)}
            </Text>

            <View className="bg-[#2C2B29]/60 rounded-2xl p-4 border border-[#4A4845]">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[#A7A4A0] font-medium text-xs uppercase tracking-wider">Monthly Usage</Text>
                <Text className="text-[#F2EFEB] font-bold text-sm">{usagePercent}%</Text>
              </View>
              <Text className="text-[#65625E] text-[10px] font-bold mb-2">
                ₹{formatCurrency(spent)} of ₹{formatCurrency(spendable)} used
              </Text>
              <View className="h-[6px] bg-[#3E3A35] rounded-full overflow-hidden">
                <Animated.View
                  className="h-full rounded-full"
                  style={[
                    progressStyle,
                    { backgroundColor: usageColor }
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)} className="flex-row justify-between mb-6" style={{ gap: 12 }}>
          <View className="flex-1 bg-[#3E3A35] rounded-[24px] p-5 border border-[#4E4B47]">
            <View className="w-8 h-8 rounded-full bg-[#2C2B29] items-center justify-center mb-3 border border-[#5D5A54]">
              <Ionicons name="shield-checkmark" size={14} color="#D3A77A" />
            </View>
            <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Daily Safe Spend</Text>
            <Text className="text-xl font-bold text-[#F2EFEB]">₹{formatCurrency(data?.dailySafeSpend ?? 0)}</Text>
            <Text className="text-[#65625E] text-[9px] mt-2 leading-[12px]">{dailyStatusText}</Text>
          </View>

          <View className={`flex-1 rounded-[24px] p-5 border ${isOverDailyLimit ? 'bg-[#4A2F2F] border-[#663A3A]' : 'bg-[#3E3A35] border-[#4E4B47]'}`}>
            <View className={`w-8 h-8 rounded-full items-center justify-center mb-3 border ${isOverDailyLimit ? 'bg-[#382020] border-[#5C2B2B]' : 'bg-[#2C2B29] border-[#5D5A54]'}`}>
              <Ionicons
                name={isOverDailyLimit ? "warning" : "trending-down"}
                size={14}
                color={isOverDailyLimit ? "#EF6C6C" : "#D3A77A"}
              />
            </View>
            <Text className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isOverDailyLimit ? 'text-[#EF6C6C]' : 'text-[#D3A77A]'}`}>Spent Today</Text>
            <Text className={`text-xl font-bold ${isOverDailyLimit ? 'text-[#FFE5E5]' : 'text-[#F2EFEB]'}`}>₹{formatCurrency(spentToday)}</Text>
            <Text className="text-[#65625E] text-[9px] mt-2 leading-[12px]">
              {latestExpense
                ? `Last: ${latestExpense.note || latestExpense.category} ₹${formatCurrency(latestExpense.amount)}`
                : 'No expenses recorded today.'}
            </Text>
          </View>
        </Animated.View>

        {/* Smart Projection */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)} className="bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47] flex-row items-center mb-6">
          <View className="w-12 h-12 bg-[#2C2B29] rounded-xl items-center justify-center mr-4 border border-[#5D5A54]">
            <Ionicons name="sparkles" size={20} color="#D3A77A" />
          </View>
          <View className="flex-1">
            <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">Smart Projection</Text>
            <Text className="text-[#F2EFEB] leading-[20px] text-sm">{prediction.message}</Text>
          </View>
        </Animated.View>

        {/* Remaining Days */}
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

        {/* Weekly spending chart */}
        <Animated.View entering={FadeInDown.duration(600).delay(450)} className="bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47] mb-6">
          <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-4">Last 7 Days</Text>
          <View className="flex-row items-end justify-between" style={{ height: 48, gap: 6 }}>
            {weeklyTrend.map((day, i) => {
              const barH = weekMax > 0 ? Math.max((day.amount / weekMax) * 100, 4) : 4;
              const isToday = i === 6;
              return (
                <WeeklyBar
                  key={i}
                  barH={barH}
                  weeklyAnim={weeklyAnim}
                  isToday={isToday}
                  label={day.label}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* Spending Insight */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)} className="bg-[#3E3A35] rounded-[24px] p-5 border border-[#4E4B47] flex-row items-center mb-12">
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

      {/* Manual SMS Paste Modal */}
      <Modal
        visible={pasteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPasteModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center px-6">
          <Animated.View
            entering={FadeInDown.duration(400)}
            className="bg-[#3E3A35] rounded-3xl p-6 border border-[#D3A77A]/30"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[#D3A77A] text-xl font-bold">Manual SMS Detection</Text>
              <TouchableOpacity onPress={() => {
                impact.light();
                setPasteModalVisible(false);
              }}>
                <Ionicons name="close" size={24} color="#A7A4A0" />
              </TouchableOpacity>
            </View>

            <Text className="text-[#A7A4A0] text-sm mb-4 leading-5">
              Paste the full body of a bank transaction SMS below. The app will parse it just like a real message.
            </Text>

            <View className="bg-[#2C2B29] rounded-2xl border border-[#D3A77A]/20 p-4 mb-6">
              <TextInput
                placeholder="Example: INR 250 spent on UPI at Swiggy..."
                placeholderTextColor="#5D5A54"
                multiline
                numberOfLines={4}
                className="text-white text-[15px] max-h-32 text-left"
                style={{ textAlignVertical: 'top' }}
                value={pastedSms}
                onChangeText={setPastedSms}
              />
            </View>

            <TouchableOpacity
              onPress={async () => {
                if (pastedSms.trim()) {
                  impact.medium();
                  const count = await simulateSms(pastedSms);
                  if (count > 0) {
                    impact.success();
                    Alert.alert("Success!", `Detected ${count} transaction from your text. Check the list above!`);
                    setPastedSms('');
                    setPasteModalVisible(false);
                  } else {
                    impact.error();
                    Alert.alert(
                      "Detection Failed",
                      "We couldn't find a valid 'Debit' transaction in this text. Please ensure it includes the amount (₹) and a word like 'spent' or 'debited'."
                    );
                  }
                }
              }}
              disabled={!pastedSms.trim()}
              className={`py-4 rounded-xl items-center ${pastedSms.trim() ? 'bg-[#D3A77A]' : 'bg-[#D3A77A]/30'}`}
            >
              <Text className={`font-bold text-[15px] ${pastedSms.trim() ? 'text-[#2B231A]' : 'text-[#D3A77A]/50'}`}>
                PROCESS SMS
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Salary Setup Overlay */}
      <Modal
        visible={showSetup || !hasSalary}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <Animated.View entering={FadeInDown} className="bg-[#383633] rounded-t-[40px] p-8 border-t border-[#4E4B47] pb-12">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-[#D3A77A] font-bold text-xl uppercase tracking-widest">
                {hasSalary ? 'Edit Salary Config' : 'Quick Setup'}
              </Text>
              {hasSalary && (
                <TouchableOpacity onPress={() => {
                  impact.light();
                  setShowSetup(false);
                }}>
                  <View className="w-10 h-10 rounded-full bg-[#2C2B29] items-center justify-center border border-[#4E4B47]">
                    <Ionicons name="close" size={24} color="#A7A4A0" />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-3 ml-1">Monthly Salary</Text>
              <View className="flex-row items-center bg-[#2C2B29] rounded-2xl px-5 py-5 border border-[#4E4B47]">
                <Text className="text-[#D3A77A] font-bold text-2xl mr-2">₹</Text>
                <TextInput
                  className="flex-1 text-[#F2EFEB] text-2xl font-black p-0"
                  placeholder="50000"
                  placeholderTextColor="#4E4B47"
                  keyboardType="numeric"
                  value={salaryInput}
                  onChangeText={setSalaryInput}
                />
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-3 ml-1">Fixed Expenses</Text>
              <View className="flex-row items-center bg-[#2C2B29] rounded-2xl px-5 py-5 border border-[#4E4B47]">
                <Text className="text-[#D3A77A] font-bold text-2xl mr-2">₹</Text>
                <TextInput
                  className="flex-1 text-[#F2EFEB] text-2xl font-black p-0"
                  placeholder="15000"
                  placeholderTextColor="#4E4B47"
                  keyboardType="numeric"
                  value={fixedInput}
                  onChangeText={setFixedInput}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                impact.heavy();
                handleSaveSalary();
              }}
              activeOpacity={0.8}
              className="bg-[#D3A77A] py-5 rounded-2xl items-center shadow-lg shadow-[#D3A77A]/20"
            >
              <Text className="text-[#2B231A] font-black text-lg uppercase tracking-wider">Start Tracking</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
