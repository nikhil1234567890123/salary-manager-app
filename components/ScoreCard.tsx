import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface ScoreCardProps {
    /** Score value from 0–100 */
    score: number;
    /** Label below the score */
    label: string;
    /** Explanation text */
    explanation: string;
    /** Optional additional info like variation level */
    badge?: string;
    /** Animation delay in ms */
    delay?: number;
}

/** Map score to a color */
function getScoreColor(score: number): string {
    if (score >= 80) return '#6CEF8A';  // green
    if (score >= 60) return '#EACFA7';  // gold
    if (score >= 40) return '#EFA46C';  // orange
    return '#EF6C6C';                   // red
}

/**
 * Score display card with animated circular progress indicator.
 * Used for Salary Stability Score on the dashboard.
 */
export default function ScoreCard({
    score,
    label,
    explanation,
    badge,
    delay = 0,
}: ScoreCardProps) {
    const color = getScoreColor(score);

    // Animate the score counter
    const animatedScore = useSharedValue(0);

    useEffect(() => {
        animatedScore.value = withDelay(
            delay + 200,
            withTiming(score, { duration: 1200, easing: Easing.out(Easing.exp) })
        );
    }, [score, delay]);

    // Progress bar width
    const progressStyle = useAnimatedStyle(() => ({
        width: `${animatedScore.value}%`,
    }));

    return (
        <Animated.View
            entering={FadeInDown.duration(600).delay(delay)}
            className="bg-[#383633] rounded-[24px] p-6 border border-[#4E4B47] mb-4"
        >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-[#2C2B29] rounded-xl items-center justify-center mr-3 border border-[#5D5A54]">
                        <Ionicons name="shield-checkmark" size={18} color={color} />
                    </View>
                    <View>
                        <Text className="text-[#F2EFEB] font-bold text-sm">{label}</Text>
                        {badge ? (
                            <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                Variation: {badge}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {/* Score number */}
                <View className="items-center">
                    <Text style={{ color, fontSize: 32, fontWeight: '900' }}>{score}</Text>
                    <Text className="text-[#65625E] text-[9px] font-bold uppercase tracking-wider">/ 100</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View className="h-2 bg-[#2C2B29] rounded-full overflow-hidden mb-3">
                <Animated.View
                    className="h-full rounded-full"
                    style={[progressStyle, { backgroundColor: color }]}
                />
            </View>

            {/* Explanation */}
            <Text className="text-[#A7A4A0] text-[12px] leading-[18px]">{explanation}</Text>
        </Animated.View>
    );
}
