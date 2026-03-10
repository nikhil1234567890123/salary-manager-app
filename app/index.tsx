import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    withSequence,
    withRepeat,
    Easing
} from "react-native-reanimated";
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/hooks/useAppTheme';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();
    const theme = useAppTheme();
    const [checked, setChecked] = useState(false);

    // Check if onboarding is complete — if not, redirect
    useEffect(() => {
        (async () => {
            try {
                const done = await AsyncStorage.getItem('@onboarding_complete');
                if (done !== 'true') {
                    router.replace('/onboarding');
                    return;
                }
            } catch { }
            setChecked(true);
        })();
    }, []);

    // Shared values
    const logoScale = useSharedValue(0);
    const logoTranslateY = useSharedValue(0); // starts in center
    const logoRotation = useSharedValue(0);

    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(40);

    const buttonOpacity = useSharedValue(0);
    const buttonTranslateY = useSharedValue(50);

    // Premium Background Animations
    const shape1Anim = useSharedValue(0);
    const shape2Anim = useSharedValue(0);
    const coin1Anim = useSharedValue(0);

    useEffect(() => {
        // 1. Logo pop-in, scale to huge, and rotate slightly
        logoRotation.value = withSequence(
            withTiming(-0.3, { duration: 150 }),
            withSpring(0, { damping: 5, stiffness: 200 })
        );

        logoScale.value = withSequence(
            // Pop up bigger
            withSpring(1.5, { damping: 10, stiffness: 100 }),
            // Wait, then shrink to normal size
            withDelay(800, withSpring(1, { damping: 14, stiffness: 100 }))
        );

        // 2. Logo moves up dramatically
        logoTranslateY.value = withDelay(
            1500,
            withSpring(-height * 0.22, { damping: 12, stiffness: 90 }) // Move up by ~22% of screen height
        );

        // 3. Texts fade & slide in after logo moves
        textOpacity.value = withDelay(1800, withTiming(1, { duration: 800 }));
        textTranslateY.value = withDelay(1800, withSpring(0, { damping: 12, stiffness: 90 }));

        // 4. Button slides up 
        buttonOpacity.value = withDelay(2100, withTiming(1, { duration: 800 }));
        buttonTranslateY.value = withDelay(2100, withSpring(0, { damping: 12, stiffness: 90 }));

        // Premium floating background
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
        coin1Anim.value = withRepeat(
            withSequence(
                withTiming(15, { duration: 5500, easing: Easing.inOut(Easing.ease) }),
                withTiming(-10, { duration: 5500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: logoTranslateY.value },
            { scale: logoScale.value },
            { rotate: `${logoRotation.value}rad` }
        ]
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }]
    }));

    const buttonStyle = useAnimatedStyle(() => ({
        opacity: buttonOpacity.value,
        transform: [{ translateY: buttonTranslateY.value }]
    }));

    const shape1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: shape1Anim.value }, { rotate: `${shape1Anim.value}deg` }]
    }));

    const shape2Style = useAnimatedStyle(() => ({
        transform: [{ translateX: shape2Anim.value }, { scale: 1 + (shape2Anim.value / 200) }]
    }));

    const coin1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: coin1Anim.value }, { rotateX: `${-coin1Anim.value * 1.5}deg` }, { rotateY: `${coin1Anim.value * 2}deg` }]
    }));

    return (
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: theme.colors.background }}>
            <StatusBar style={theme.isDark ? "light" : "dark"} />

            {/* Premium 3D Matte Neo-morphic Background */}
            <View className="absolute inset-0 z-0 overflow-hidden">
                <Animated.View
                    style={[shape2Style, { width: height * 1.2, height: height * 1.2, borderRadius: height / 2, backgroundColor: theme.colors.primary }]}
                    className="absolute -top-[15%] -right-[40%] opacity-15 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                />
                <Animated.View
                    style={[shape1Style, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                    className="absolute top-[12%] left-[15%] w-20 h-20 rounded-full justify-center items-center border shadow-[0_15px_20px_rgba(0,0,0,0.8)]"
                >
                    <View className="w-[60px] h-[60px] rounded-full border-2" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.primary }} />
                </Animated.View>
                {/* Floating Splash Coin */}
                <Animated.View
                    style={[coin1Style, { opacity: logoScale, backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]} // fade in with logo
                    className="absolute bottom-[25%] -right-[8%] w-24 h-24 rounded-full justify-center items-center shadow-[0_15px_30px_rgba(0,0,0,0.6)] border-[4px]"
                >
                    <View className="w-[70px] h-[70px] rounded-full border justify-center items-center" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                        <Text className="font-black text-3xl" style={{ color: theme.colors.primary }}>₹</Text>
                    </View>
                </Animated.View>
                <View className="absolute inset-0" style={{ backgroundColor: theme.colors.background + '66' }} />
            </View>


            <Animated.View
                style={[logoStyle, { position: 'absolute', backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}
                className="w-28 h-28 rounded-[36px] items-center justify-center shadow-2xl z-20 overflow-hidden border"
            >
                <Ionicons name="wallet" size={48} color={theme.colors.primary} />
            </Animated.View>

            {/* Content Container (Fades in below the logo's new moved position) */}
            <Animated.View style={textStyle} className="items-center z-10 w-full mt-28">
                <Text className="text-5xl font-black tracking-tight mb-4 text-center" style={{ color: theme.colors.primary }}>
                    Salary Manager
                </Text>

                <Text className="text-center text-[15px] px-4 leading-[22px]" style={{ color: theme.colors.textSecondary }}>
                    Organize, track, and master your monthly stipend with premium precision.
                </Text>
            </Animated.View>

            {/* Premium Gold Action Button */}
            <Animated.View
                style={[buttonStyle, { position: 'absolute', bottom: 48, width: '100%', paddingHorizontal: 35 }]}
            >
                <TouchableOpacity
                    onPress={() => router.replace("/(tabs)")}
                    activeOpacity={0.8}
                    className="rounded-full shadow-xl shadow-black/60 mb-4"
                    style={{ elevation: 10, backgroundColor: theme.colors.primary }}
                >
                    <View className="py-5 rounded-full items-center justify-center flex-row border-t border-b" style={{ backgroundColor: theme.colors.primary, borderTopColor: theme.colors.primary + '33', borderBottomColor: theme.colors.primary + '66' }}>
                        <Text className="font-extrabold text-[15px] tracking-wide mr-2" style={{ color: theme.colors.background }}>
                            Get Started
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color={theme.colors.background} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push("/login")}
                    activeOpacity={0.7}
                    className="items-center justify-center py-2"
                >
                    <Text className="font-bold text-sm tracking-widest uppercase" style={{ color: theme.colors.textSecondary }}>
                        Sign In
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
