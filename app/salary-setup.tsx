import { View, Text, TextInput, TouchableOpacity, Dimensions, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const { height, width } = Dimensions.get('window');

const PremiumInput = ({ label, value, onChangeText, placeholder, icon, delay = 0, onCalculatorPress }: any) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <Animated.View entering={FadeInDown.duration(600).delay(delay)} className="mb-6">
            <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-2 ml-1">{label}</Text>
            <View
                className={`flex-row items-center bg-[#383633] rounded-[24px] px-5 py-[18px] border shadow-lg ${isFocused ? 'border-[#A87D56] bg-[#3E3A35] shadow-black/40' : 'border-[#4E4B47] shadow-black/20'
                    }`}
                style={{ elevation: isFocused ? 8 : 4 }}
            >
                <View className="mr-3">
                    <Ionicons name={icon} size={20} color={isFocused ? '#D3A77A' : '#A7A4A0'} />
                </View>
                <Text className="text-xl font-bold text-[#A87D56] mr-2">₹</Text>
                <TextInput
                    className="flex-1 text-[#F2EFEB] text-xl font-bold p-0"
                    placeholder={placeholder}
                    placeholderTextColor="#65625E"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    selectionColor="#EACFA7"
                />
                {onCalculatorPress && (
                    <TouchableOpacity onPress={onCalculatorPress} className="ml-2 bg-[#4E4B47] p-2 rounded-full border border-[#5D5A54]">
                        <Ionicons name="calculator" size={18} color="#D3A77A" />
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
};

const CalculatorOverlay = ({ isVisible, onClose, onApply }: { isVisible: boolean, onClose: () => void, onApply: (val: string) => void }) => {
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

            <View className="bg-[#2C2B29] rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-[2px] border-[#4E4B47] w-full max-w-sm self-center">

                {/* Close Button & Title */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-[#A7A4A0] text-sm font-bold uppercase tracking-widest">Fixed Outflows Calc</Text>
                    <TouchableOpacity onPress={onClose} className="p-2 bg-[#383633] rounded-full border border-[#4E4B47]">
                        <Ionicons name="close" size={20} color="#A7A4A0" />
                    </TouchableOpacity>
                </View>

                {/* Number Display */}
                <View className="bg-[#1E1D1C] rounded-[24px] p-5 mb-6 border border-[#3E3A35] items-end min-h-[100px] justify-center shadow-inner">
                    <Text className="text-[#A7A4A0] text-lg font-medium mb-1 tracking-widest">{expr || "0"}</Text>
                    <Text className="text-[40px] font-black text-[#D3A77A] leading-[48px]">
                        {result ? `₹${result}` : "₹0"}
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
                                                    className="w-full bg-[#D3A77A] rounded-[20px] items-center justify-center border border-[#EACFA7] shadow-[0_5px_15px_rgba(211,167,122,0.3)] absolute top-0 left-0"
                                                    style={{ height: '220%' }}
                                                >
                                                    <Ionicons name="checkmark-done" size={28} color="#2B231A" />
                                                    <Text className="text-[#2B231A] font-black text-xs uppercase mt-1">Apply</Text>
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
                                            ? 'bg-[#3E3A35] border-[#D3A77A]/30'
                                            : isAction
                                                ? 'bg-[#4A2F2F] border-[#663A3A]'
                                                : 'bg-[#383633] border-[#4E4B47]'
                                            }`}
                                    >
                                        {btn === '⌫' ? (
                                            <Ionicons name="backspace-outline" size={24} color="#EF6C6C" />
                                        ) : (
                                            <Text className={`text-2xl font-black ${isOperator ? 'text-[#D3A77A]' : isAction ? 'text-[#EF6C6C]' : 'text-[#F2EFEB]'
                                                }`}>{btn}</Text>
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
    const [salary, setSalary] = useState("");
    const [fixedExpenses, setFixedExpenses] = useState("");
    const [savingsGoal, setSavingsGoal] = useState("");
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
            await AsyncStorage.setItem('stipend_setup', JSON.stringify({
                totalSalary: salaryNum,
                fixedExpenses: fixedExpensesNum,
                predictedSavings: savingsNum,
                dailySafeSpend: dailySafeSpend,
                remainingBalance: balanceAfterFixed,
                spentThisMonth: 0,
                spentToday: 0
            }));
            router.replace("/(tabs)");
        } catch (e) {
            console.error("failed to save data", e);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-[#2C2B29]"
        >
            <StatusBar style="light" />

            {/* Premium 3D Matte Background Elements */}
            <View className="absolute inset-0 z-0 overflow-hidden">
                <Animated.View
                    style={[shape2Style, { width: height, height: height, borderRadius: height / 2 }]}
                    className="absolute -top-[20%] -left-[30%] bg-[#D3A77A] opacity-[0.08] blur-3xl"
                />

                {/* Floating Coins */}
                <Animated.View
                    style={coin1Style}
                    className="absolute top-[15%] right-[5%] w-16 h-16 rounded-full bg-[#383633] justify-center items-center shadow-[0_10px_25px_rgba(0,0,0,0.5)] border-[3px] border-[#A87D56]"
                >
                    <View className="w-[45px] h-[45px] rounded-full border border-[#5D5A54] justify-center items-center bg-[#2C2B29]">
                        <Text className="text-[#D3A77A] font-black text-xl">₹</Text>
                    </View>
                </Animated.View>

                <Animated.View
                    style={coin2Style}
                    className="absolute bottom-[25%] -left-[8%] w-24 h-24 rounded-full bg-[#D3A77A] justify-center items-center shadow-[0_15px_30px_rgba(211,167,122,0.2)] border-[4px] border-[#EACFA7]"
                >
                    <View className="w-[70px] h-[70px] rounded-full border border-[#B88758] justify-center items-center">
                        <Ionicons name="pie-chart" size={32} color="#6C4B2B" />
                    </View>
                </Animated.View>

                <Animated.View
                    style={[shape1Style]}
                    className="absolute top-[40%] right-[10%] w-10 h-10 rounded-full bg-[#4A4640] border border-[#5D5A54] shadow-lg opacity-60"
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
                    <Text className="text-[#A7A4A0] text-sm uppercase tracking-widest font-bold mb-2">Initialization</Text>
                    <Text className="text-4xl font-black text-[#D3A77A] leading-[44px]">Config{"\n"}Stipend.</Text>
                    <Text className="text-[#A7A4A0] mt-3 leading-relaxed text-[15px]">
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
                    />

                    <PremiumInput
                        label="Fixed Outflows (Rent, EMI, etc)"
                        placeholder="0"
                        value={fixedExpenses}
                        onChangeText={setFixedExpenses}
                        icon="home"
                        delay={200}
                        onCalculatorPress={() => setIsCalcVisible(true)}
                    />

                    <PremiumInput
                        label="Target Savings (Optional)"
                        placeholder={`${salaryNum ? Math.floor(salaryNum * 0.2) : "0"} (Default 20%)`}
                        value={savingsGoal}
                        onChangeText={setSavingsGoal}
                        icon="trending-up"
                        delay={300}
                    />
                </View>

                {/* Live Calculation Result Card */}
                <Animated.View entering={FadeInUp.duration(600).delay(500)} className="mt-6 mb-8">
                    <View className={`rounded-[24px] p-6 border shadow-xl flex-row items-center justify-between transition-colors duration-300 ${salaryNum > 0 ? 'bg-[#3E3A35] border-[#D3A77A]/30 shadow-black/40' : 'bg-[#2C2B29] border-[#4E4B47] shadow-none'
                        }`}>
                        <View>
                            <Text className={`text-xs font-bold uppercase tracking-widest mb-1 ${salaryNum > 0 ? 'text-[#D3A77A]' : 'text-[#65625E]'}`}>
                                Daily Limit
                            </Text>
                            <Text className={`text-4xl font-black ${salaryNum > 0 ? 'text-[#F2EFEB]' : 'text-[#65625E]'}`}>
                                ₹{dailySafeSpend}
                            </Text>
                        </View>
                        <View className={`w-12 h-12 rounded-full items-center justify-center border ${salaryNum > 0 ? 'bg-[#D3A77A]/10 border-[#D3A77A]/30' : 'bg-[#383633] border-[#4E4B47]'
                            }`}>
                            <Ionicons name="checkmark-done" size={24} color={salaryNum > 0 ? '#D3A77A' : '#65625E'} />
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Premium Action Button Fixed at Bottom */}
            <View pointerEvents="box-none" className="absolute bottom-0 left-0 right-0 p-6 pt-2 bg-gradient-to-t from-[#2C2B29] to-transparent z-50">
                <Animated.View entering={FadeInUp.duration(600).delay(600)}>
                    <TouchableOpacity
                        onPress={handleFinalize}
                        activeOpacity={0.8}
                        disabled={salaryNum <= 0}
                        className={`rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.6)] ${salaryNum <= 0 ? 'opacity-50' : 'opacity-100'}`}
                        style={{ elevation: 15 }}
                    >
                        <View className={`py-5 rounded-full items-center justify-center flex-row border ${salaryNum > 0
                            ? 'bg-[#D1A677] border-t-[#EACFA7] border-b-[#A87D56]'
                            : 'bg-[#4E4B47] border-[#5D5A54]'
                            }`}>
                            <Text className={`font-extrabold text-[15px] tracking-wide mr-2 ${salaryNum > 0 ? 'text-[#2B231A]' : 'text-[#A7A4A0]'}`}>
                                Finalize Setup
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color={salaryNum > 0 ? '#2B231A' : '#A7A4A0'} />
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
            />
        </KeyboardAvoidingView>
    );
}
