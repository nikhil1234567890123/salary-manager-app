import { View, Text, TextInput, TouchableOpacity, Dimensions, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCurrency } from '@/utils/formatters';
import { useFinance } from '@/context/FinanceContext';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    withRepeat,
    withSequence,
    Easing,
    FadeInDown,
    FadeInUp
} from "react-native-reanimated";
import { useAppTheme } from '@/hooks/useAppTheme';

const { height, width } = Dimensions.get('window');

const PremiumInput = ({ label, value, onChangeText, placeholder, icon, delay = 0, onCalculatorPress, theme }: any) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <Animated.View entering={FadeInDown.duration(600).delay(delay)} className="mb-6">
            <Text className="text-xs font-bold uppercase tracking-widest mb-2 ml-1" style={{ color: theme.colors.textSecondary }}>{label}</Text>
            <View
                className={`flex-row items-center rounded-[24px] px-5 py-[18px] border shadow-lg ${isFocused ? 'shadow-black/40' : 'shadow-black/20'}`}
                style={{
                    elevation: isFocused ? 8 : 4,
                    backgroundColor: isFocused ? theme.colors.surface : theme.colors.card,
                    borderColor: isFocused ? theme.colors.primary : theme.colors.border
                }}
            >
                <View className="mr-3">
                    <Ionicons name={icon} size={20} color={isFocused ? theme.colors.primary : theme.colors.icon} />
                </View>
                <Text className="text-xl font-bold mr-2" style={{ color: theme.colors.primary }}>₹</Text>
                <TextInput
                    className="flex-1 text-xl font-bold p-0"
                    style={{ color: theme.colors.text }}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textSecondary + '80'}
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    selectionColor={theme.colors.primary}
                />
                {onCalculatorPress && (
                    <TouchableOpacity onPress={onCalculatorPress} className="ml-2 p-2 rounded-full border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                        <Ionicons name="calculator" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
};

const CalculatorOverlay = ({ isVisible, onClose, onApply, theme }: { isVisible: boolean, onClose: () => void, onApply: (val: string) => void, theme: any }) => {
    const [expr, setExpr] = useState("");
    const [result, setResult] = useState("");

    // Calculate automatically whenever expression changes
    useEffect(() => {
        if (!expr) {
            setResult("");
            return;
        }
        try {
            // Safe evaluation of basic math
            // eslint-disable-next-line no-new-func
            const res = new Function(`return ${expr}`)();
            if (isFinite(res)) {
                setResult(Math.floor(res).toString()); // Keep it integer for stipends
            } else {
                setResult("");
            }
        } catch {
            setResult(""); // Invalid expression mid-typing
        }
    }, [expr]);

    const handlePress = (val: string) => {
        if (val === 'C') {
            setExpr("");
            setResult("");
        } else if (val === '⌫') {
            setExpr(prev => prev.slice(0, -1));
        } else {
            // Prevent multiple operators
            const lastChar = expr.slice(-1);
            if (['+', '-', '*', '/'].includes(val) && ['+', '-', '*', '/'].includes(lastChar)) {
                return;
            }
            setExpr(prev => prev + val);
        }
    };

    const handleApply = () => {
        if (result) {
            onApply(result);
        } else if (expr && !isNaN(Number(expr))) {
            onApply(expr);
        }
    };

    if (!isVisible) return null;

    const buttons = [
        ['C', '⌫', '/', '*'],
        ['7', '8', '9', '-'],
        ['4', '5', '6', '+'],
        ['1', '2', '3', ''],
        ['0', '00', '.', '']
    ];

    return (
        <Animated.View entering={FadeInUp.duration(400)} className="absolute bottom-0 left-0 right-0 z-50 p-4">
            {/* Backdrop */}
            <TouchableOpacity className="absolute -top-[100vh] left-0 right-0 h-[100vh]" onPress={onClose} activeOpacity={1} />

            <View className="rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-[2px] w-full max-w-sm self-center" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>

                {/* Close Button & Title */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-sm font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>Fixed Outflows Calc</Text>
                    <TouchableOpacity onPress={onClose} className="p-2 rounded-full border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                        <Ionicons name="close" size={20} color={theme.colors.icon} />
                    </TouchableOpacity>
                </View>

                {/* Number Display */}
                <View className="rounded-[24px] p-5 mb-6 border items-end min-h-[100px] justify-center shadow-inner" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                    <Text className="text-lg font-medium mb-1 tracking-widest" style={{ color: theme.colors.textSecondary }}>{expr || "0"}</Text>
                    <Text className="text-[40px] font-black leading-[48px]" style={{ color: theme.colors.primary }}>
                        {result ? `₹${formatCurrency(parseFloat(result))}` : "₹0"}
                    </Text>
                </View>

                {/* Keypad */}
                <View className="flex-col gap-3 relative pb-1">
                    {buttons.map((row, rIndex) => (
                        <View key={rIndex} className="flex-row justify-between gap-3 relative z-10">
                            {row.map((btn, bIndex) => {
                                if (btn === '') {
                                    if (rIndex === 3 && bIndex === 3) {
                                        // Big Apply Button spanning 2 rows
                                        return (
                                            <View key="apply-wrapper" className="w-[22%] z-50">
                                                <TouchableOpacity
                                                    onPress={handleApply}
                                                    activeOpacity={0.8}
                                                    className="w-full rounded-[20px] items-center justify-center border shadow-[0_5px_15px_rgba(0,0,0,0.3)] absolute top-0 left-0"
                                                    style={{ height: '220%', backgroundColor: theme.colors.primary, borderColor: theme.colors.primary + '66' }}
                                                >
                                                    <Ionicons name="checkmark-done" size={28} color={theme.colors.background} />
                                                    <Text className="font-black text-xs uppercase mt-1" style={{ color: theme.colors.background }}>Apply</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    }
                                    return <View key={`empty-${bIndex}`} className="w-[22%]" />; // Placeholder for the big apply button
                                }

                                const isOperator = ['/', '*', '-', '+'].includes(btn);
                                const isAction = ['C', '⌫'].includes(btn);

                                return (
                                    <TouchableOpacity
                                        key={btn}
                                        onPress={() => handlePress(btn)}
                                        activeOpacity={0.7}
                                        className={`w-[22%] aspect-square rounded-[20px] items-center justify-center border ${isOperator
                                            ? 'bg-opacity-20'
                                            : isAction
                                                ? 'bg-opacity-20'
                                                : ''
                                            }`}
                                        style={{
                                            backgroundColor: isOperator ? theme.colors.primary + '20' : isAction ? theme.colors.danger + '20' : theme.colors.card,
                                            borderColor: isOperator ? theme.colors.primary + '40' : isAction ? theme.colors.danger + '40' : theme.colors.border
                                        }}
                                    >
                                        {btn === '⌫' ? (
                                            <Ionicons name="backspace-outline" size={24} color={theme.colors.danger} />
                                        ) : (
                                            <Text className="text-2xl font-black" style={{ color: isOperator ? theme.colors.primary : isAction ? theme.colors.danger : theme.colors.text }}>{btn}</Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>
        </Animated.View>
    );
};

export default function SalarySetupScreen() {
    const router = useRouter();
    const theme = useAppTheme();
    const { salary: existingSalary, setSalaryConfig } = useFinance();
    const [salary, setSalary] = useState(existingSalary ? existingSalary.monthlySalary.toString() : "");
    const [fixedExpenses, setFixedExpenses] = useState(existingSalary ? existingSalary.fixedExpenses.toString() : "");
    const [savingsGoal, setSavingsGoal] = useState(
        existingSalary?.savingsTarget !== undefined ? existingSalary.savingsTarget.toString() :
            (existingSalary ? Math.round(existingSalary.monthlySalary * existingSalary.savingsRate).toString() : "")
    );
    const [creditDate, setCreditDate] = useState(existingSalary?.salaryCreditDate ? existingSalary.salaryCreditDate.toString() : "");
    const [isCalcVisible, setIsCalcVisible] = useState(false);

    // Background Animations
    const shape1Anim = useSharedValue(0);
    const shape2Anim = useSharedValue(0);
    const coin1Anim = useSharedValue(0);
    const coin2Anim = useSharedValue(0);

    useEffect(() => {
        shape1Anim.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
                withTiming(10, { duration: 10000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
        shape2Anim.value = withRepeat(
            withSequence(
                withTiming(20, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
                withTiming(-15, { duration: 12000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
        coin1Anim.value = withRepeat(
            withSequence(
                withTiming(15, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
                withTiming(-10, { duration: 5000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        coin2Anim.value = withRepeat(
            withSequence(
                withTiming(-20, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
                withTiming(5, { duration: 6000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const shape1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: shape1Anim.value }, { rotate: `${shape1Anim.value}deg` }]
    }));
    const shape2Style = useAnimatedStyle(() => ({
        transform: [{ translateX: shape2Anim.value }, { scale: 1 + (shape2Anim.value / 150) }]
    }));
    const coin1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: coin1Anim.value }, { rotateX: `${coin1Anim.value * 2}deg` }, { rotateY: `${coin1Anim.value * 1.5}deg` }]
    }));
    const coin2Style = useAnimatedStyle(() => ({
        transform: [{ translateY: coin2Anim.value }, { rotateX: `${-coin2Anim.value * 1.5}deg` }, { rotateY: `${coin2Anim.value * 2}deg` }]
    }));

    // Calculations
    const salaryNum = parseFloat(salary) || 0;
    const fixedExpensesNum = parseFloat(fixedExpenses) || 0;
    const savingsNum = savingsGoal ? (parseFloat(savingsGoal) || 0) : (salaryNum * 0.2); // Default 20%
    const balanceAfterFixed = salaryNum - fixedExpensesNum - savingsNum;
    const dailySafeSpend = balanceAfterFixed > 0 ? Math.floor(balanceAfterFixed / 30) : 0; // Approx 30 days

    const handleFinalize = async () => {
        if (salaryNum <= 0) return;
        try {
            await setSalaryConfig({
                monthlySalary: salaryNum,
                fixedExpenses: fixedExpensesNum,
                savingsRate: salaryNum > 0 ? savingsNum / salaryNum : 0.2,
                savingsTarget: savingsNum,
                salaryCreditDate: parseInt(creditDate) || undefined
            });
            router.replace("/(tabs)");
        } catch (e) {
            console.error("failed to save data", e);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: theme.colors.background }}
        >
            <StatusBar style={theme.isDark ? "light" : "dark"} />

            {/* Premium 3D Matte Background Elements */}
            <View className="absolute inset-0 z-0 overflow-hidden">
                <Animated.View
                    style={[shape2Style, { width: height, height: height, borderRadius: height / 2, backgroundColor: theme.colors.primary }]}
                    className="absolute -top-[20%] -left-[30%] opacity-[0.08] blur-3xl"
                />

                {/* Floating Coins */}
                <Animated.View
                    style={[coin1Style, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
                    className="absolute top-[15%] right-[5%] w-16 h-16 rounded-full justify-center items-center shadow-[0_10px_25px_rgba(0,0,0,0.5)] border-[3px]"
                >
                    <View className="w-[45px] h-[45px] rounded-full border justify-center items-center" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                        <Text className="font-black text-xl" style={{ color: theme.colors.primary }}>₹</Text>
                    </View>
                </Animated.View>

                <Animated.View
                    style={[coin2Style, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary + '66' }]}
                    className="absolute bottom-[25%] -left-[8%] w-24 h-24 rounded-full justify-center items-center shadow-[0_15px_30px_rgba(0,0,0,0.2)] border-[4px]"
                >
                    <View className="w-[70px] h-[70px] rounded-full border justify-center items-center" style={{ borderColor: theme.colors.background + '40' }}>
                        <Ionicons name="pie-chart" size={32} color={theme.colors.background} />
                    </View>
                </Animated.View>

                <Animated.View
                    style={[shape1Style, { backgroundColor: theme.colors.icon, borderColor: theme.colors.border }]}
                    className="absolute top-[40%] right-[10%] w-10 h-10 rounded-full border shadow-lg opacity-60"
                />
            </View>

            <ScrollView
                className="flex-1 z-10"
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(600)} className="mb-10">
                    <View className="mb-4">
                        <View className="w-12 h-12 rounded-[16px] items-center justify-center border overflow-hidden" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                            <Image
                                source={require("../assets/images/app_logo_fixed.png")}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                            />
                        </View>
                    </View>
                    <Text className="text-sm uppercase tracking-widest font-bold mb-2" style={{ color: theme.colors.textSecondary }}>Initialization</Text>
                    <Text className="text-4xl font-black leading-[44px]" style={{ color: theme.colors.primary }}>Config{"\n"}Stipend.</Text>
                    <Text className="mt-3 leading-relaxed text-[15px]" style={{ color: theme.colors.textSecondary }}>
                        Input your core parameters to calculate your dynamic daily allowance.
                    </Text>
                </Animated.View>

                {/* Forms */}
                <View>
                    <PremiumInput
                        label="Monthly Stipend / Salary"
                        placeholder="0"
                        value={salary}
                        onChangeText={setSalary}
                        icon="wallet"
                        delay={100}
                        theme={theme}
                    />

                    <PremiumInput
                        label="Fixed Outflows (Rent, EMI, etc)"
                        placeholder="0"
                        value={fixedExpenses}
                        onChangeText={setFixedExpenses}
                        icon="home"
                        delay={200}
                        onCalculatorPress={() => setIsCalcVisible(true)}
                        theme={theme}
                    />

                    <PremiumInput
                        label="Target Savings (Optional)"
                        placeholder={`${salaryNum ? Math.floor(salaryNum * 0.2) : "0"} (Default 20%)`}
                        value={savingsGoal}
                        onChangeText={setSavingsGoal}
                        icon="trending-up"
                        delay={300}
                        theme={theme}
                    />

                    <PremiumInput
                        label="Salary Credit Date (1-31) (Optional)"
                        placeholder="e.g. 1"
                        value={creditDate}
                        onChangeText={setCreditDate}
                        icon="calendar"
                        delay={400}
                        theme={theme}
                    />
                </View>

                {/* Live Calculation Result Card */}
                <Animated.View entering={FadeInUp.duration(600).delay(500)} className="mt-6 mb-8">
                    <View
                        className="rounded-[24px] p-6 border shadow-xl flex-row items-center justify-between"
                        style={{
                            backgroundColor: salaryNum > 0 ? theme.colors.surface : theme.colors.background,
                            borderColor: salaryNum > 0 ? theme.colors.primary + '33' : theme.colors.border
                        }}
                    >
                        <View>
                            <Text className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: salaryNum > 0 ? theme.colors.primary : theme.colors.textSecondary }}>
                                Daily Limit
                            </Text>
                            <Text className="text-4xl font-black" style={{ color: salaryNum > 0 ? theme.colors.text : theme.colors.textSecondary + '80' }}>
                                ₹{formatCurrency(dailySafeSpend)}
                            </Text>
                        </View>
                        <View className="w-12 h-12 rounded-full items-center justify-center border" style={{ backgroundColor: salaryNum > 0 ? theme.colors.primary + '1A' : theme.colors.card, borderColor: salaryNum > 0 ? theme.colors.primary + '33' : theme.colors.border }}>
                            <Ionicons name="checkmark-done" size={24} color={salaryNum > 0 ? theme.colors.primary : theme.colors.icon} />
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Premium Action Button Fixed at Bottom */}
            <View pointerEvents="box-none" className="absolute bottom-0 left-0 right-0 p-6 pt-2 z-50">
                <Animated.View entering={FadeInUp.duration(600).delay(600)}>
                    <TouchableOpacity
                        onPress={handleFinalize}
                        activeOpacity={0.8}
                        disabled={salaryNum <= 0}
                        className={`rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.6)] ${salaryNum <= 0 ? 'opacity-50' : 'opacity-100'}`}
                        style={{ elevation: 15 }}
                    >
                        <View
                            className="py-5 rounded-full items-center justify-center flex-row border"
                            style={{
                                backgroundColor: salaryNum > 0 ? theme.colors.primary : theme.colors.card,
                                borderTopColor: theme.colors.primary + '33',
                                borderBottomColor: theme.colors.primary + '66',
                                borderColor: theme.colors.border
                            }}
                        >
                            <Text className="font-extrabold text-[15px] tracking-wide mr-2" style={{ color: salaryNum > 0 ? theme.colors.background : theme.colors.textSecondary }}>
                                Finalize Setup
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color={salaryNum > 0 ? theme.colors.background : theme.colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
            {/* Floating Calculator Overlay */}
            <CalculatorOverlay
                isVisible={isCalcVisible}
                onClose={() => setIsCalcVisible(false)}
                onApply={(val) => {
                    setFixedExpenses(val);
                    setIsCalcVisible(false);
                }}
                theme={theme}
            />
        </KeyboardAvoidingView>
    );
}
