import { View, Text, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    interpolate,
    Extrapolation,
    withRepeat,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const InputContainer = ({
    icon, placeholder, keyboardType, secureTextEntry, staggerVal, isNameField = false,
    focusedInput, setFocusedInput, showPassword, setShowPassword, entranceOpacity, nameFieldStyle,
    value, onChangeText
}: any) => {
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: staggerVal ? staggerVal.value : 0 }],
        opacity: entranceOpacity.value
    }));

    const isFocused = focusedInput === placeholder;

    const content = (
        <View
            className={`flex-row items-center bg-[#383633] rounded-[24px] px-5 py-[18px] border mb-5 shadow-lg ${isFocused
                ? 'border-[#A87D56] bg-[#3E3A35] shadow-md shadow-[#D3A77A]/30'
                : 'border-[#4E4B47] shadow-black/25'
                }`}
            style={{ elevation: 5 }}
        >
            <Ionicons
                name={icon}
                size={22}
                color={isFocused ? '#D3A77A' : '#A7A4A0'}
                style={{ marginRight: 15 }}
            />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#A7A4A0"
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry && !showPassword}
                onFocus={() => setFocusedInput(placeholder)}
                onBlur={() => setFocusedInput(null)}
                className="flex-1 text-[#F2EFEB] text-base font-medium p-0"
                selectionColor="#EACFA7"
                style={secureTextEntry && !showPassword && value?.length > 0 ? { letterSpacing: 4, fontSize: 18 } : {}}
            />
            {secureTextEntry && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-3 px-2 py-1">
                    <Text className="text-[11px] font-bold tracking-wider" style={{ color: showPassword ? '#D3A77A' : '#65625E' }}>
                        {showPassword ? 'HIDE' : 'SHOW'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return isNameField ? (
        <Animated.View style={[nameFieldStyle, animStyle]} className="overflow-hidden">
            {content}
        </Animated.View>
    ) : (
        <Animated.View style={[animStyle]}>
            {content}
        </Animated.View>
    );
};

export default function LoginScreen() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Animation values
    const entranceOpacity = useSharedValue(0);
    const modeSwitchAnim = useSharedValue(0); // 0 = login, 1 = signup

    // Premium slow rotating/moving 3D shapes
    const shape1Anim = useSharedValue(0);
    const shape2Anim = useSharedValue(0);
    const coin1Anim = useSharedValue(0);
    const coin2Anim = useSharedValue(0);
    const coin3Anim = useSharedValue(0);

    // Staggered items
    const stagger1 = useSharedValue(100);
    const stagger2 = useSharedValue(100);
    const stagger3 = useSharedValue(100);
    const stagger4 = useSharedValue(100);

    useEffect(() => {
        // Smooth cinematic entrance
        entranceOpacity.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.exp) });

        stagger1.value = withDelay(150, withSpring(0, { damping: 14, stiffness: 60 }));
        stagger2.value = withDelay(300, withSpring(0, { damping: 14, stiffness: 60 }));
        stagger3.value = withDelay(450, withSpring(0, { damping: 14, stiffness: 60 }));
        stagger4.value = withDelay(600, withSpring(0, { damping: 14, stiffness: 60 }));

        // Elegant floating shapes mimic the "premium card" sweeps
        shape1Anim.value = withRepeat(
            withSequence(
                withTiming(-20, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
                withTiming(15, { duration: 12000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
        shape2Anim.value = withRepeat(
            withSequence(
                withTiming(25, { duration: 15000, easing: Easing.inOut(Easing.sin) }),
                withTiming(-10, { duration: 15000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );

        // 3D floating coins animation
        coin1Anim.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                withTiming(5, { duration: 4000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        coin2Anim.value = withRepeat(
            withSequence(
                withTiming(15, { duration: 5500, easing: Easing.inOut(Easing.ease) }),
                withTiming(-10, { duration: 5500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        coin3Anim.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 4800, easing: Easing.inOut(Easing.ease) }),
                withTiming(8, { duration: 4800, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const toggleMode = () => {
        setIsLogin(!isLogin);
        modeSwitchAnim.value = withSpring(isLogin ? 1 : 0, { damping: 15, stiffness: 70 });
    };

    const shape1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: shape1Anim.value }, { rotate: `${shape1Anim.value}deg` }]
    }));

    const shape2Style = useAnimatedStyle(() => ({
        transform: [{ translateX: shape2Anim.value }, { scale: 1 + (shape2Anim.value / 200) }]
    }));

    const coin1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: coin1Anim.value }, { rotateX: `${coin1Anim.value * 2}deg` }, { rotateY: `${coin1Anim.value * 1.5}deg` }]
    }));
    const coin2Style = useAnimatedStyle(() => ({
        transform: [{ translateY: coin2Anim.value }, { rotateX: `${-coin2Anim.value * 1.5}deg` }, { rotateY: `${coin2Anim.value * 2}deg` }]
    }));
    const coin3Style = useAnimatedStyle(() => ({
        transform: [{ translateY: coin3Anim.value }, { rotateX: `${coin3Anim.value * 2.5}deg` }, { rotateY: `${-coin3Anim.value * 1.5}deg` }]
    }));

    // Dynamic height and opacity for the "Name" field during Signup
    const nameFieldStyle = useAnimatedStyle(() => {
        return {
            opacity: modeSwitchAnim.value,
            height: interpolate(modeSwitchAnim.value, [0, 1], [0, 85], Extrapolation.CLAMP), // Larger height to account for margins
            marginBottom: interpolate(modeSwitchAnim.value, [0, 1], [0, 0], Extrapolation.CLAMP),
            transform: [
                { scale: interpolate(modeSwitchAnim.value, [0, 1], [0.95, 1], Extrapolation.CLAMP) },
                { translateY: interpolate(modeSwitchAnim.value, [0, 1], [-10, 0], Extrapolation.CLAMP) }
            ]
        }
    });

    const titleTranslateStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(modeSwitchAnim.value, [0, 1], [0, 5]) }],
        opacity: interpolate(modeSwitchAnim.value, [0, 0.5, 1], [1, 0, 1])
    }));

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-[#2C2B29]"
        >
            <StatusBar style="light" />

            {/* Premium 3D Matte Neo-morphic Background */}
            <View className="absolute inset-0 z-0 overflow-hidden">
                {/* Large architectural sweep */}
                <Animated.View
                    style={[shape2Style, { width: height * 1.2, height: height * 1.2, borderRadius: height / 2 }]}
                    className="absolute -top-[15%] -right-[40%] bg-[#D3A77A] opacity-15 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                />

                {/* Floating "lens/dial" element mimicking a physical premium object */}
                <Animated.View
                    style={[shape1Style]}
                    className="absolute top-[12%] right-[15%] w-20 h-20 rounded-full bg-[#4A4640] justify-center items-center border border-[#5D5A54] shadow-[0_15px_20px_rgba(0,0,0,0.8)]"
                >
                    <View className="w-[60px] h-[60px] rounded-full bg-[#35332F] border-2 border-[#A87D56]" />
                </Animated.View>

                {/* --- 3D Stipend Core Elements (Coins) --- */}
                {/* Coin 1 - Top Left */}
                <Animated.View
                    style={[coin1Style, { opacity: entranceOpacity.value }]}
                    className="absolute top-[22%] -left-[5%] w-16 h-16 rounded-full bg-[#D3A77A] justify-center items-center shadow-[0_10px_25px_rgba(211,167,122,0.3)] border-[3px] border-[#EACFA7]"
                >
                    <View className="w-[45px] h-[45px] rounded-full border border-[#B88758] justify-center items-center">
                        <Text className="text-[#6C4B2B] font-black text-xl">₹</Text>
                    </View>
                </Animated.View>

                {/* Coin 2 - Middle Right */}
                <Animated.View
                    style={[coin2Style, { opacity: entranceOpacity.value }]}
                    className="absolute top-[55%] -right-[8%] w-24 h-24 rounded-full bg-[#383633] justify-center items-center shadow-[0_15px_30px_rgba(0,0,0,0.6)] border-[4px] border-[#A87D56]"
                >
                    <View className="w-[70px] h-[70px] rounded-full border border-[#5D5A54] justify-center items-center bg-[#2C2B29]">
                        <Ionicons name="wallet" size={32} color="#D3A77A" />
                    </View>
                </Animated.View>

                {/* Coin 3 - Bottom Left */}
                <Animated.View
                    style={[coin3Style, { opacity: entranceOpacity.value }]}
                    className="absolute bottom-[20%] left-[10%] w-12 h-12 rounded-full bg-[#EACFA7] justify-center items-center shadow-[0_8px_20px_rgba(234,207,167,0.4)] border-2 border-[#FFFFFF]"
                >
                    <View className="w-[30px] h-[30px] rounded-full border border-[#D3A77A] justify-center items-center">
                        <Text className="text-[#A87D56] font-bold text-sm">₹</Text>
                    </View>
                </Animated.View>

                {/* Deep background shadow overlay to create depth */}
                <View className="absolute inset-0 bg-[#2C2B29]/40" />
            </View>

            {/* Foreground UI Layer - Scrollable for Keyboard */}
            <ScrollView
                className="flex-1 w-full"
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 35, paddingVertical: 48, justifyContent: 'center' }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                {/* Elegant Typography Header */}
                <Animated.View style={[{ opacity: entranceOpacity.value, transform: [{ translateY: stagger1.value }] }]} className="mb-10 mt-4">
                    <View className="mb-6">
                        <View className="w-16 h-16 bg-[#3E3A35] rounded-[20px] items-center justify-center shadow-lg border border-[#D3A77A]/30 overflow-hidden">
                            <Image
                                source={require("../assets/images/app_logo_fixed.png")}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                            />
                        </View>
                    </View>
                    <Animated.Text style={[titleTranslateStyle]} className="text-[48px] font-bold text-[#D3A77A] leading-[52px] mb-4">
                        {isLogin ? 'Track.\nMaster.' : 'Begin.\nJourney.'}
                    </Animated.Text>
                    <Text className="text-[15px] text-[#A7A4A0] leading-[22px] pr-10">
                        {isLogin ? "Take control of your monthly stipend and personal expenses." : "Start organizing your finances and reach your savings goals early."}
                    </Text>
                </Animated.View>

                {/* Form Elements */}
                <View className="w-full">
                    <InputContainer
                        isNameField
                        icon="person"
                        placeholder="Full Name"
                        staggerVal={stagger2}
                        focusedInput={focusedInput} setFocusedInput={setFocusedInput}
                        entranceOpacity={entranceOpacity} nameFieldStyle={nameFieldStyle}
                        value={name} onChangeText={setName}
                    />

                    <InputContainer
                        icon="mail"
                        placeholder="Email Address"
                        keyboardType="email-address"
                        staggerVal={stagger2}
                        focusedInput={focusedInput} setFocusedInput={setFocusedInput}
                        entranceOpacity={entranceOpacity}
                        value={email} onChangeText={setEmail}
                    />

                    <InputContainer
                        icon="lock-closed"
                        placeholder="Passcode"
                        secureTextEntry
                        staggerVal={stagger3}
                        focusedInput={focusedInput} setFocusedInput={setFocusedInput}
                        showPassword={showPassword} setShowPassword={setShowPassword}
                        entranceOpacity={entranceOpacity}
                        value={password} onChangeText={setPassword}
                    />

                    {isLogin && (
                        <Animated.View style={[{ opacity: entranceOpacity.value }]} className="self-start mb-[35px] ml-1">
                            <TouchableOpacity>
                                <Text className="text-[#A7A4A0] text-sm font-medium">Recover Access</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {/* Premium Gold Action Button */}
                    <Animated.View style={{ opacity: entranceOpacity.value, transform: [{ translateY: stagger4.value }] }}>
                        <TouchableOpacity
                            onPress={() => router.replace("/salary-setup")}
                            activeOpacity={0.8}
                            className="bg-[#D3A77A] rounded-full shadow-xl shadow-black/60"
                            style={{ elevation: 10 }}
                        >
                            <View className="py-5 rounded-full items-center justify-center bg-[#D1A677] border-t border-t-[#EACFA7] border-b border-b-[#A87D56]">
                                <Text className="text-[#2B231A] text-base font-extrabold tracking-wide">
                                    {isLogin ? 'Access Portal' : 'Create Account'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Minimalist Divider */}
                    <Animated.View style={[{ opacity: entranceOpacity.value }]} className="flex-row items-center my-[35px] px-5">
                        <View className="flex-1 h-px bg-[#4A4845]" />
                        <Text className="text-[#65625E] mx-[15px] text-sm font-medium lowercase">or</Text>
                        <View className="flex-1 h-px bg-[#4A4845]" />
                    </Animated.View>

                    {/* Minimalist Corporate Sign In */}
                    <Animated.View style={{ opacity: entranceOpacity.value }}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            className="flex-row items-center justify-center bg-transparent rounded-full py-[18px] border-[1.5px] border-[#514E4A]"
                        >
                            <Ionicons name="logo-google" size={20} color="#F2EFEB" />
                            <Text className="text-[#F2EFEB] text-[15px] font-semibold ml-3">
                                Authenticate with Google
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Toggle Login/Signup */}
                <Animated.View style={[{ opacity: entranceOpacity.value, marginTop: 40, paddingBottom: Platform.OS === 'ios' ? 20 : 0 }]} className="items-center">
                    <TouchableOpacity onPress={toggleMode} className="p-2">
                        <Text className="text-[#A7A4A0] text-sm">
                            {isLogin ? "New to our services? " : "Already an admin? "}
                            <Text className="text-[#D3A77A] font-bold">
                                {isLogin ? 'Enroll Now' : 'Enter Portal'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}
