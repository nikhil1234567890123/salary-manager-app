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
  useAnimatedScrollHandler
} from "react-native-reanimated";
import { useFinance } from '@/context/FinanceContext';
import { useImpact } from '@/hooks/useImpact';
import { PremiumBackground3D } from '@/components/PremiumBackground3D';
import { Butterfly } from '@/components/Butterfly';
import {
  predictEndOfMonth,
  getWeeklySpendingTrend,
  getLatestExpenseToday,
  getHomeInsight,
  getUsageColor,
} from '@/utils/analyticsEngine';
import { formatCurrency } from '@/utils/formatters';
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from '@/store/settingsStore';
import PaydayCelebrationModal, { createPaydayEvent } from '@/components/PaydayCelebrationModal';
import { useAppTheme } from '@/hooks/useAppTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height } = Dimensions.get('window');

// Sub-component for individual animated bars to follow Rules of Hooks
const WeeklyBar = ({ barH, weeklyAnim, isToday, label, theme }: { barH: number; weeklyAnim: any; isToday: boolean; label: string; theme: any }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    height: `${barH * weeklyAnim.value}%`,
  }));

  return (
    <View className="flex-1 items-center">
      <Animated.View
        className="w-full rounded-md"
        style={[
          {
            backgroundColor: isToday ? theme.colors.primary : theme.colors.border,
            minHeight: 3,
          },
          animatedStyle,
        ]}
      />
      <Text className="text-[8px] font-bold mt-1" style={{ color: isToday ? theme.colors.primary : theme.colors.icon }}>{label}</Text>
    </View>
  );
};

export default function HomeScreen() {
  const { salary, dashboardData, expenses, setSalaryConfig, refreshData } = useFinance();
  const { settings } = useSettings();
  const theme = useAppTheme();

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

  // Payday celebration state
  const [showPayday, setShowPayday] = useState(false);
  const [paydayEvent, setPaydayEvent] = useState<ReturnType<typeof createPaydayEvent> | null>(null);

  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  // Background & UI Animations
  const weeklyAnim = useSharedValue(0);
  const bgAnim = useSharedValue(0);
  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bgAnim.value }],
  }));

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

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
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={['top']}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Immserive 3D Background */}
      <PremiumBackground3D scrollY={scrollY} />

      {/* Pink Theme Special: Butterfly */}
      {settings.activeThemeId === 'pinkFinance' && <Butterfly />}

      <View className="absolute inset-0 overflow-hidden">
        <Animated.View
          style={[bgStyle, { width: height, height: height, borderRadius: height / 2, backgroundColor: theme.colors.primary }]}
          className="absolute -top-[20%] -right-[40%] opacity-[0.06]"
        />
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
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
            className="mb-6 mt-4 border rounded-2xl p-4 overflow-hidden"
            style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.primary + '4D' }}
          >
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: theme.colors.primary + '33' }}>
                <Ionicons name="flask-outline" size={18} color={theme.colors.primary} />
              </View>
              <Text className="font-bold text-sm tracking-wide" style={{ color: theme.colors.primary }}>SIMULATION MODE</Text>
            </View>

            <Text className="text-xs leading-[18px] mb-4" style={{ color: theme.colors.textSecondary }}>
              Expo Go cannot read real SMS. Copy your bank SMS and paste it below to test "Auto-Detection".
            </Text>

            <TouchableOpacity
              onPress={() => {
                impact.medium();
                setPasteModalVisible(true);
              }}
              activeOpacity={0.8}
              className="flex-row items-center border py-3 px-5 rounded-2xl"
              style={{ backgroundColor: theme.colors.primary + '1A', borderColor: theme.colors.primary }}
            >
              <Ionicons name="clipboard-outline" size={18} color={theme.colors.primary} />
              <Text className="font-bold text-sm ml-2" style={{ color: theme.colors.primary }}>PASTE BANK SMS</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Offline Privacy Badge */}
        {settings.offlinePrivacyMode && (
          <Animated.View
            entering={FadeInDown.duration(400)}
            className="flex-row items-center border rounded-full px-4 py-2 mt-4 mb-2 self-start"
            style={{ backgroundColor: theme.colors.success + '1A', borderColor: theme.colors.success + '4D' }}
          >
            <Ionicons name="shield-checkmark" size={14} color={theme.colors.success} />
            <Text className="text-[10px] font-bold uppercase tracking-widest ml-2" style={{ color: theme.colors.success }}>Local Data Only</Text>
          </Animated.View>
        )}

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} className="flex-row justify-between items-center mb-8 mt-6">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-xl items-center justify-center mr-3 border overflow-hidden shadow-lg"
              style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.primary + '4D', shadowColor: theme.colors.primary }}>
              <Image
                source={require("../../assets/images/app_logo_fixed.png")}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
            <View>
              <Text className="font-medium text-xs tracking-widest uppercase mb-0.5" style={{ color: theme.colors.textSecondary }}>Overview</Text>
              <Text className="text-2xl font-black" style={{ color: theme.colors.text }}>Salary Manager</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              impact.light();
              setShowSetup(!showSetup);
            }}
            className="w-12 h-12 rounded-full items-center justify-center border ml-4"
            style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
          >
            <Ionicons name="settings-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Background AI Status */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} className="flex-row mb-6" style={{ gap: 10 }}>
          <View className="flex-1 px-4 py-4 rounded-2xl border flex-row items-center" style={{ backgroundColor: theme.colors.surface + '80', borderColor: theme.colors.border }}>
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3 border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
              <Ionicons name="scan-outline" size={18} color={theme.colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.colors.textSecondary }}>Background AI</Text>
              <Text className="text-xs font-bold" style={{ color: theme.colors.text }}>Auto-Entry Active</Text>
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
              className="px-3 py-2 rounded-lg"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Text className="font-bold text-[10px] uppercase" style={{ color: theme.colors.background }}>Scan Now</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Pending Transactions (from SMS) */}
        {detectedTransactions.length > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4 px-1">
              <Text className="font-bold text-xs uppercase tracking-widest" style={{ color: theme.colors.primary }}>
                Pending Confirmation ({detectedTransactions.length})
              </Text>
            </View>

            {detectedTransactions.map((tx, idx) => (
              <Animated.View
                key={tx.id}
                entering={FadeInDown.delay(100 * idx)}
                exiting={FadeOutLeft.duration(300)}
                layout={Layout.springify()}
                className="rounded-2xl p-4 border mb-3 shadow-sm"
                style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.primary + '66' }}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: theme.colors.primary }} />
                      <Text className="font-bold text-sm" numberOfLines={1} style={{ color: theme.colors.text }}>
                        {tx.merchant}
                      </Text>
                    </View>
                    <Text className="text-[10px] font-medium uppercase tracking-tighter" style={{ color: theme.colors.textSecondary }}>
                      {tx.category} • {tx.date}
                    </Text>
                  </View>
                  <Text className="font-black text-lg" style={{ color: theme.colors.primary }}>
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
                    className="flex-1 py-2.5 rounded-xl items-center"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    <Text className="font-bold text-xs" style={{ color: theme.colors.background }}>CONFIRM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      impact.light();
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      await dismissTransaction(tx);
                    }}
                    className="px-4 py-2.5 rounded-xl items-center border"
                    style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.colors.textSecondary} />
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
            className="rounded-[28px] p-7 shadow-lg border mb-6 relative overflow-hidden"
            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
          >
            <View className="absolute -right-8 -top-8 w-32 h-32 rounded-full" style={{ backgroundColor: theme.colors.primary + '1A' }} />
            <View className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full" style={{ backgroundColor: theme.colors.primary + '0D' }} />

            <Text className="font-semibold text-xs tracking-widest uppercase mb-2" style={{ color: theme.colors.textSecondary }}>Remaining Balance</Text>
            <Text className="text-[42px] font-black mb-6 tracking-tighter" style={{ color: theme.colors.text }}>
              <Text className="text-3xl" style={{ color: theme.colors.primary }}>₹</Text>
              {formatCurrency(data?.remainingBalance ?? 0)}
            </Text>

            <View className="rounded-2xl p-4 border" style={{ backgroundColor: theme.colors.background + '99', borderColor: theme.colors.border }}>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-medium text-xs uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>Monthly Usage</Text>
                <Text className="font-bold text-sm" style={{ color: theme.colors.text }}>{usagePercent}%</Text>
              </View>
              <Text className="text-[10px] font-bold mb-2" style={{ color: theme.colors.textSecondary }}>
                ₹{formatCurrency(spent)} of ₹{formatCurrency(spendable)} used
              </Text>
              <View className="h-[6px] rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.surface }}>
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
          <View className="flex-1 rounded-[24px] p-5 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
            <View className="w-8 h-8 rounded-full items-center justify-center mb-3 border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
              <Ionicons name="shield-checkmark" size={14} color={theme.colors.success} />
            </View>
            <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.colors.textSecondary }}>Daily Safe Spend</Text>
            <Text className="text-xl font-bold" style={{ color: theme.colors.text }}>₹{formatCurrency(data?.dailySafeSpend ?? 0)}</Text>
            <Text className="text-[9px] mt-2 leading-[12px]" style={{ color: theme.colors.icon }}>{dailyStatusText}</Text>
          </View>

          <View className={`flex-1 rounded-[24px] p-5 border`} style={{ backgroundColor: isOverDailyLimit ? theme.colors.danger + '33' : theme.colors.surface, borderColor: isOverDailyLimit ? theme.colors.danger + '80' : theme.colors.border }}>
            <View className={`w-8 h-8 rounded-full items-center justify-center mb-3 border`} style={{ backgroundColor: isOverDailyLimit ? theme.colors.danger + '4D' : theme.colors.background, borderColor: isOverDailyLimit ? theme.colors.danger : theme.colors.border }}>
              <Ionicons
                name={isOverDailyLimit ? "warning" : "trending-down"}
                size={14}
                color={isOverDailyLimit ? theme.colors.danger : theme.colors.primary}
              />
            </View>
            <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: isOverDailyLimit ? theme.colors.danger : theme.colors.primary }}>Spent Today</Text>
            <Text className="text-xl font-bold" style={{ color: theme.colors.text }}>₹{formatCurrency(spentToday)}</Text>
            <Text className="text-[9px] mt-2 leading-[12px]" style={{ color: theme.colors.icon }}>
              {latestExpense
                ? `Last: ${latestExpense.note || latestExpense.category} ₹${formatCurrency(latestExpense.amount)}`
                : 'No expenses recorded today.'}
            </Text>
          </View>
        </Animated.View>

        {/* Smart Projection */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)} className="rounded-[24px] p-5 border flex-row items-center mb-6" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
          <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
            <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.colors.textSecondary }}>Smart Projection</Text>
            <Text className="leading-[20px] text-sm" style={{ color: theme.colors.text }}>{prediction.message}</Text>
          </View>
        </Animated.View>

        {/* Remaining Days */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)} className="rounded-[24px] p-5 border flex-row items-center mb-6" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
          <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.colors.textSecondary }}>Remaining Days</Text>
            <Text className="text-lg font-bold" style={{ color: theme.colors.text }}>{remainingDays} days left</Text>
            <Text className="text-[10px] mt-1" style={{ color: theme.colors.icon }}>Safe spending available: ₹{formatCurrency(dailyLimit)}/day</Text>
          </View>
        </Animated.View>

        {/* Weekly spending chart */}
        <Animated.View entering={FadeInDown.duration(600).delay(450)} className="rounded-[24px] p-5 border mb-6" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
          <Text className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: theme.colors.textSecondary }}>Last 7 Days</Text>
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
                  theme={theme}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* Spending Insight */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)} className="rounded-[24px] p-5 border flex-row items-center mb-12" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
          <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
            <Ionicons name="bulb-outline" size={20} color={theme.colors.warning} />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.colors.textSecondary }}>Insight</Text>
            <Text className="text-sm leading-[20px]" style={{ color: theme.colors.text }}>{homeInsight}</Text>
          </View>
        </Animated.View>

        <View className="h-24" />
      </Animated.ScrollView>

      {/* Payday Celebration Modal */}
      <PaydayCelebrationModal
        visible={showPayday}
        event={paydayEvent}
        onDismiss={() => setShowPayday(false)}
        onAction={(actionId) => {
          impact.medium();
          setShowPayday(false);
          // Actions can be extended: navigate to savings, rent, or budget screens
        }}
      />

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
            className="rounded-3xl p-6 border"
            style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.primary + '4D' }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold" style={{ color: theme.colors.primary }}>Manual SMS Detection</Text>
              <TouchableOpacity onPress={() => {
                impact.light();
                setPasteModalVisible(false);
              }}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text className="text-sm mb-4 leading-5" style={{ color: theme.colors.textSecondary }}>
              Paste the full body of a bank transaction SMS below. The app will parse it just like a real message.
            </Text>

            <View className="rounded-2xl border p-4 mb-6" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.primary + '33' }}>
              <TextInput
                placeholder="Example: INR 250 spent on UPI at Swiggy..."
                placeholderTextColor={theme.colors.border}
                multiline
                numberOfLines={4}
                className="text-[15px] max-h-32 text-left"
                style={{ textAlignVertical: 'top', color: theme.colors.text }}
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
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: pastedSms.trim() ? theme.colors.primary : theme.colors.primary + '4D' }}
            >
              <Text className="font-bold text-[15px]" style={{ color: pastedSms.trim() ? theme.colors.background : theme.colors.primary + '80' }}>
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
          <Animated.View entering={FadeInDown} className="rounded-t-[40px] p-8 border-t pb-12" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
            <View className="flex-row justify-between items-center mb-8">
              <Text className="font-bold text-xl uppercase tracking-widest" style={{ color: theme.colors.primary }}>
                {hasSalary ? 'Edit Salary Config' : 'Quick Setup'}
              </Text>
              {hasSalary && (
                <TouchableOpacity onPress={() => {
                  impact.light();
                  setShowSetup(false);
                }}>
                  <View className="w-10 h-10 rounded-full items-center justify-center border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-xs font-bold uppercase tracking-widest mb-3 ml-1" style={{ color: theme.colors.textSecondary }}>Monthly Salary</Text>
              <View className="flex-row items-center rounded-2xl px-5 py-5 border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                <Text className="font-bold text-2xl mr-2" style={{ color: theme.colors.primary }}>₹</Text>
                <TextInput
                  className="flex-1 text-2xl font-black p-0"
                  style={{ color: theme.colors.text }}
                  placeholder="50000"
                  placeholderTextColor={theme.colors.border}
                  keyboardType="numeric"
                  value={salaryInput}
                  onChangeText={setSalaryInput}
                />
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-xs font-bold uppercase tracking-widest mb-3 ml-1" style={{ color: theme.colors.textSecondary }}>Fixed Expenses</Text>
              <View className="flex-row items-center rounded-2xl px-5 py-5 border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                <Text className="font-bold text-2xl mr-2" style={{ color: theme.colors.primary }}>₹</Text>
                <TextInput
                  className="flex-1 text-2xl font-black p-0"
                  style={{ color: theme.colors.text }}
                  placeholder="15000"
                  placeholderTextColor={theme.colors.border}
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
              className="py-5 rounded-2xl items-center shadow-lg"
              style={{ backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }}
            >
              <Text className="font-black text-lg uppercase tracking-wider" style={{ color: theme.colors.background }}>Start Tracking</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
