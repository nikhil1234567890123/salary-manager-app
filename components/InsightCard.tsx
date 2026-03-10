import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';

interface InsightCardProps {
    /** Card title */
    title: string;
    /** Main insight text (supports multi-line) */
    body: string;
    /** Ionicons icon name */
    icon: keyof typeof Ionicons.glyphMap;
    /** Accent color for icon and highlights */
    accentColor?: string;
    /** Optional emoji to display alongside the title */
    emoji?: string;
    /** Optional subtitle / secondary label */
    subtitle?: string;
    /** Animation delay in ms */
    delay?: number;
}

/**
 * Reusable insight card for displaying text-based financial insights.
 * Follows the app's dark theme design system.
 */
export default function InsightCard({
    title,
    body,
    icon,
    accentColor = '#D3A77A',
    emoji,
    subtitle,
    delay = 0,
}: InsightCardProps) {
    const theme = useAppTheme();
    return (
        <Animated.View
            entering={FadeInDown.duration(600).delay(delay)}
            className="rounded-[24px] p-5 border mb-4"
            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
        >
            {/* Header row */}
            <View className="flex-row items-center mb-3">
                <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3 border"
                    style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
                >
                    <Ionicons name={icon} size={18} color={accentColor === '#D3A77A' ? theme.colors.primary : accentColor} />
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center">
                        {emoji ? (
                            <Text className="text-base mr-1.5">{emoji}</Text>
                        ) : null}
                        <Text className="font-bold text-sm" style={{ color: theme.colors.text }}>{title}</Text>
                    </View>
                    {subtitle ? (
                        <Text className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: theme.colors.textSecondary }}>
                            {subtitle}
                        </Text>
                    ) : null}
                </View>
            </View>

            {/* Body */}
            <Text className="text-[13px] leading-[20px]" style={{ color: theme.colors.textSecondary }}>{body}</Text>
        </Animated.View>
    );
}
