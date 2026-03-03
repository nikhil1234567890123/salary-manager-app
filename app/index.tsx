import { View, Text, TouchableOpacity, Dimensions } from "react-native";
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
import { useEffect } from "react";

const { height } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();

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
        <View className="flex-1 bg-[#2C2B29] items-center justify-center px-6">
            <StatusBar style="light" />

            {/* Premium 3D Matte Neo-morphic Background */}
            <View className="absolute inset-0 z-0 overflow-hidden">
                <Animated.View
                    style={[shape2Style, { width: height * 1.2, height: height * 1.2, borderRadius: height / 2 }]}
                    className="absolute -top-[15%] -right-[40%] bg-[#D3A77A] opacity-15 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                />
                <Animated.View
                    style={[shape1Style]}
                    className="absolute top-[12%] left-[15%] w-20 h-20 rounded-full bg-[#4A4640] justify-center items-center border border-[#5D5A54] shadow-[0_15px_20px_rgba(0,0,0,0.8)]"
                >
                    <View className="w-[60px] h-[60px] rounded-full bg-[#35332F] border-2 border-[#A87D56]" />
                </Animated.View>
                {/* Floating Splash Coin */}
                <Animated.View
                    style={[coin1Style, { opacity: logoScale }]} // fade in with logo
                    className="absolute bottom-[25%] -right-[8%] w-24 h-24 rounded-full bg-[#383633] justify-center items-center shadow-[0_15px_30px_rgba(0,0,0,0.6)] border-[4px] border-[#A87D56]"
                >
                    <View className="w-[70px] h-[70px] rounded-full border border-[#5D5A54] justify-center items-center bg-[#2C2B29]">
                        <Text className="text-[#D3A77A] font-black text-3xl">₹</Text>
                    </View>
                </Animated.View>
                <View className="absolute inset-0 bg-[#2C2B29]/40" />
            </View>


            {/* Logo initially dead center absolutely until it moves up */}
            <Animated.View
                style={[logoStyle, { position: 'absolute' }]}
                className="w-28 h-28 bg-[#3E3A35] rounded-[36px] items-center justify-center shadow-2xl shadow-[#D3A77A]/20 border border-[#D3A77A] z-20"
            >
                <Ionicons name="wallet" size={54} color="#D3A77A" />
            </Animated.View>

            {/* Content Container (Fades in below the logo's new moved position) */}
            <Animated.View style={textStyle} className="items-center z-10 w-full mt-28">
                <Text className="text-5xl font-black text-[#D3A77A] tracking-tight mb-4 text-center">
                    Salary Manager
                </Text>

                <Text className="text-[#A7A4A0] text-center text-[15px] px-4 leading-[22px]">
                    Organize, track, and master your monthly stipend with premium precision.
                </Text>
            </Animated.View>

            {/* Premium Gold Action Button */}
            <Animated.View
                style={[buttonStyle, { position: 'absolute', bottom: 48, width: '100%', paddingHorizontal: 35 }]}
            >
                <TouchableOpacity
                    onPress={() => router.push("/login")}
                    activeOpacity={0.8}
                    className="bg-[#D3A77A] rounded-full shadow-xl shadow-black/60"
                    style={{ elevation: 10 }}
                >
                    <View className="py-5 rounded-full items-center justify-center flex-row bg-[#D1A677] border-t border-t-[#EACFA7] border-b border-b-[#A87D56]">
                        <Text className="text-[#2B231A] font-extrabold text-[15px] tracking-wide mr-2">
                            Get Started
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color="#2B231A" />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
