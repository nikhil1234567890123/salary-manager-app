import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
    const content = (
        <View className="bg-[#383633] rounded-[24px] p-5 border border-[#4E4B47]">
            <View className="w-9 h-9 bg-[#2C2B29] rounded-xl items-center justify-center border border-[#5D5A54] mb-3">
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-1">
                {label}
            </Text>
            <Text className="text-[#F2EFEB] text-lg font-extrabold">{value}</Text>
            {subtitle ? (
                <Text className="text-[#65625E] text-[10px] mt-1.5 leading-[14px]">
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
