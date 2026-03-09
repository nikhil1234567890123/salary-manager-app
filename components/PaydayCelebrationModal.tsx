import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { PaydayEvent } from '@/types/insights';
import { formatCurrency } from '@/utils/formatters';

interface PaydayCelebrationModalProps {
    /** Whether the modal is visible */
    visible: boolean;
    /** Payday event data */
    event: PaydayEvent | null;
    /** Called when the user dismisses the modal */
    onDismiss: () => void;
    /** Called when user selects a quick action */
    onAction?: (actionId: string) => void;
}

const ACTION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    allocate_savings: 'leaf-outline',
    pay_rent: 'home-outline',
    set_budget: 'wallet-outline',
};

const ACTION_COLORS: Record<string, string> = {
    allocate_savings: '#6BCB77',
    pay_rent: '#4FC1E8',
    set_budget: '#D3A77A',
};

/**
 * Celebration modal shown when salary is detected.
 * Displays the credited amount and provides quick financial actions.
 */
export default function PaydayCelebrationModal({
    visible,
    event,
    onDismiss,
    onAction,
}: PaydayCelebrationModalProps) {
    if (!event) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onDismiss}
        >
            <View className="flex-1 bg-black/80 justify-center px-6">
                <Animated.View
                    entering={FadeInUp.duration(600).springify()}
                    className="bg-[#383633] rounded-[32px] p-8 border border-[#D3A77A]/30 items-center"
                >
                    {/* Celebration header */}
                    <View className="w-20 h-20 bg-[#2C2B29] rounded-full items-center justify-center mb-5 border-2 border-[#D3A77A]/40">
                        <Text className="text-4xl">🎉</Text>
                    </View>

                    <Text className="text-[#D3A77A] text-2xl font-black mb-2">Salary Received!</Text>
                    <Text className="text-[#F2EFEB] text-4xl font-black tracking-tighter mb-1">
                        ₹{formatCurrency(event.amount)}
                    </Text>
                    <Text className="text-[#A7A4A0] text-xs mb-8">credited to your account</Text>

                    {/* Quick Actions */}
                    <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-4 self-start">
                        Quick Actions
                    </Text>

                    {event.quickActions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            onPress={() => onAction?.(action.id)}
                            activeOpacity={0.7}
                            className="bg-[#2C2B29] rounded-2xl p-4 mb-3 flex-row items-center border border-[#4E4B47] w-full"
                        >
                            <View
                                className="w-10 h-10 rounded-xl items-center justify-center mr-3 border border-[#5D5A54]"
                                style={{ backgroundColor: '#383633' }}
                            >
                                <Ionicons
                                    name={ACTION_ICONS[action.id] || 'arrow-forward'}
                                    size={18}
                                    color={ACTION_COLORS[action.id] || '#D3A77A'}
                                />
                            </View>
                            <Text className="text-[#F2EFEB] font-bold text-sm flex-1">{action.label}</Text>
                            <Ionicons name="chevron-forward" size={16} color="#65625E" />
                        </TouchableOpacity>
                    ))}

                    {/* Dismiss */}
                    <TouchableOpacity
                        onPress={onDismiss}
                        className="mt-4 py-3 px-8"
                    >
                        <Text className="text-[#65625E] font-bold text-sm uppercase tracking-wider">
                            Dismiss
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

/**
 * Helper to create a standard PaydayEvent with default quick actions.
 */
export function createPaydayEvent(amount: number): PaydayEvent {
    return {
        amount,
        quickActions: [
            { id: 'allocate_savings', label: 'Allocate to Savings', icon: 'leaf-outline' },
            { id: 'pay_rent', label: 'Pay Rent', icon: 'home-outline' },
            { id: 'set_budget', label: 'Set Monthly Budget', icon: 'wallet-outline' },
        ],
    };
}
