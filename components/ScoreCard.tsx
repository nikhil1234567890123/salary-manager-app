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
import { useAppTheme } from '@/hooks/useAppTheme';
import { ThemeColors } from '@/types/theme';

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
function getScoreColor(score: number, colors: ThemeColors): string {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    if (score >= 40) return colors.danger;
    return colors.danger;
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
    const theme = useAppTheme();
    const color = getScoreColor(score, theme.colors);

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
            className="rounded-[24px] p-6 border mb-4"
            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                        <Ionicons name="shield-checkmark" size={18} color={color} />
                    </View>
                    <View>
                        <Text className="font-bold text-sm" style={{ color: theme.colors.text }}>{label}</Text>
                        {badge ? (
                            <Text className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                Variation: {badge}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {/* Score number */}
                <View className="items-center">
                    <Text style={{ color, fontSize: 32, fontWeight: '900' }}>{score}</Text>
                    <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>/ 100</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: theme.colors.surface }}>
                <Animated.View
                    className="h-full rounded-full"
                    style={[progressStyle, { backgroundColor: color }]}
                />
            </View>

            {/* Explanation */}
            <Text className="text-[12px] leading-[18px]" style={{ color: theme.colors.textSecondary }}>{explanation}</Text>
        </Animated.View>
    );
}
