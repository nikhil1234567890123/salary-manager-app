import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

type AlertVariant = 'warning' | 'danger' | 'info';

interface FinancialAlertProps {
    /** Alert title */
    title: string;
    /** Main warning/info message (supports \n for newlines) */
    message: string;
    /** Optional suggestion text */
    suggestion?: string;
    /** Visual variant */
    variant?: AlertVariant;
    /** Optional percentage badge */
    percentage?: number;
    /** Animation delay in ms */
    delay?: number;
}

const VARIANT_CONFIG: Record<AlertVariant, {
    bg: string;
    border: string;
    iconBg: string;
    iconBorder: string;
    iconColor: string;
    iconName: keyof typeof Ionicons.glyphMap;
    titleColor: string;
}> = {
    warning: {
        bg: '#3D3520',
        border: '#5C4F2D',
        iconBg: '#332C18',
        iconBorder: '#5C4F2D',
        iconColor: '#EFA46C',
        iconName: 'alert-circle',
        titleColor: '#EFA46C',
    },
    danger: {
        bg: '#3D2020',
        border: '#5C2D2D',
        iconBg: '#331818',
        iconBorder: '#5C2D2D',
        iconColor: '#EF6C6C',
        iconName: 'warning',
        titleColor: '#EF6C6C',
    },
    info: {
        bg: '#203D3D',
        border: '#2D5C5C',
        iconBg: '#183333',
        iconBorder: '#2D5C5C',
        iconColor: '#4FC1E8',
        iconName: 'information-circle',
        titleColor: '#4FC1E8',
    },
};

/**
 * Alert-style card for Financial Leak Detector and Survival Timer.
 * Supports warning, danger, and info visual variants.
 */
export default function FinancialAlert({
    title,
    message,
    suggestion,
    variant = 'warning',
    percentage,
    delay = 0,
}: FinancialAlertProps) {
    const config = VARIANT_CONFIG[variant];

    return (
        <Animated.View
            entering={FadeInDown.duration(600).delay(delay)}
            className="rounded-[24px] p-5 mb-4 border"
            style={{ backgroundColor: config.bg, borderColor: config.border }}
        >
            {/* Header */}
            <View className="flex-row items-center mb-3">
                <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3 border"
                    style={{ backgroundColor: config.iconBg, borderColor: config.iconBorder }}
                >
                    <Ionicons name={config.iconName} size={18} color={config.iconColor} />
                </View>
                <View className="flex-1">
                    <Text style={{ color: config.titleColor }} className="font-bold text-sm">
                        {title}
                    </Text>
                </View>
                {percentage !== undefined && (
                    <View
                        className="px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: config.iconBg, borderWidth: 1, borderColor: config.iconBorder }}
                    >
                        <Text style={{ color: config.iconColor }} className="text-xs font-bold">
                            {percentage}%
                        </Text>
                    </View>
                )}
            </View>

            {/* Message */}
            <Text className="text-[#D9D6D2] text-[13px] leading-[20px] mb-2">{message}</Text>

            {/* Suggestion */}
            {suggestion ? (
                <View className="flex-row items-start mt-1">
                    <Ionicons name="bulb-outline" size={14} color="#EACFA7" style={{ marginRight: 6, marginTop: 2 }} />
                    <Text className="text-[#EACFA7] text-[12px] leading-[18px] flex-1">{suggestion}</Text>
                </View>
            ) : null}
        </Animated.View>
    );
}
