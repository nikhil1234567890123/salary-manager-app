import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';

interface DashboardStatCardProps {
    /** Card label */
    label: string;
    /** Display value */
    value: string;
    /** Ionicons icon name */
    icon: keyof typeof Ionicons.glyphMap;
    /** Icon accent color */
    color: string;
    /** Optional subtitle / extra info */
    subtitle?: string;
    /** Animation delay */
    delay?: number;
    /** Optional press handler */
    onPress?: () => void;
}

/**
 * Generic stat card for the dashboard.
 * Extracted from the repeated pattern in dashboard.tsx for reuse.
 */
export default function DashboardStatCard({
    label,
    value,
    icon,
    color,
    subtitle,
    delay = 0,
    onPress,
}: DashboardStatCardProps) {
    const theme = useAppTheme();
    const content = (
        <View className="rounded-[24px] p-5 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
            <View className="w-9 h-9 rounded-xl items-center justify-center border mb-3" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.colors.textSecondary }}>
                {label}
            </Text>
            <Text className="text-lg font-extrabold" style={{ color: theme.colors.text }}>{value}</Text>
            {subtitle ? (
                <Text className="text-[10px] mt-1.5 leading-[14px]" style={{ color: theme.colors.textSecondary }}>
                    {subtitle}
                </Text>
            ) : null}
        </View>
    );

    return (
        <Animated.View entering={FadeInDown.duration(600).delay(delay)}>
            {onPress ? (
                <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                    {content}
                </TouchableOpacity>
            ) : (
                content
            )}
        </Animated.View>
    );
}
