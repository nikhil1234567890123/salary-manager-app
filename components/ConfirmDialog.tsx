import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'success' | 'default';
    icon?: keyof typeof Ionicons.glyphMap;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    icon,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const iconName = icon ?? (variant === 'danger' ? 'warning' : variant === 'success' ? 'checkmark-circle' : 'information-circle');
    const accentColor = variant === 'danger' ? '#EF6C6C' : variant === 'success' ? '#6CEF8A' : '#D3A77A';
    const iconBg = variant === 'danger' ? 'bg-[#4A2F2F]' : variant === 'success' ? 'bg-[#2C3B29]' : 'bg-[#3E3A35]';
    const iconBorder = variant === 'danger' ? 'border-[#663A3A]' : variant === 'success' ? 'border-[#3A6648]' : 'border-[#5D5A54]';

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                <View className="bg-[#383633] rounded-[28px] p-7 mx-8 border-[1.5px] border-[#4E4B47] w-[85%] max-w-[340px]">
                    {/* Icon */}
                    <View className="items-center mb-5">
                        <View className={`w-16 h-16 ${iconBg} border ${iconBorder} rounded-full items-center justify-center`}>
                            <Ionicons name={iconName} size={28} color={accentColor} />
                        </View>
                    </View>

                    {/* Title */}
                    <Text className="text-[#F2EFEB] text-xl font-black text-center mb-2">{title}</Text>

                    {/* Message */}
                    <Text className="text-[#A7A4A0] text-sm text-center leading-5 mb-7">{message}</Text>

                    {/* Buttons */}
                    <View className="flex-row" style={{ gap: 12 }}>
                        <TouchableOpacity
                            onPress={onCancel}
                            className="flex-1 py-4 rounded-2xl bg-[#2C2B29] border border-[#4E4B47] items-center"
                            activeOpacity={0.7}
                        >
                            <Text className="text-[#A7A4A0] font-bold text-sm">{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onConfirm}
                            className="flex-1 py-4 rounded-2xl items-center"
                            style={{ backgroundColor: accentColor }}
                            activeOpacity={0.7}
                        >
                            <Text className="text-[#2B231A] font-extrabold text-sm">{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ─── Simple Alert (single button, no cancel) ─────────────────
export interface AlertDialogProps {
    visible: boolean;
    title: string;
    message: string;
    buttonText?: string;
    variant?: 'danger' | 'success' | 'default';
    icon?: keyof typeof Ionicons.glyphMap;
    onClose: () => void;
}

export function AlertDialog({
    visible,
    title,
    message,
    buttonText = 'OK',
    variant = 'default',
    icon,
    onClose,
}: AlertDialogProps) {
    const iconName = icon ?? (variant === 'danger' ? 'warning' : variant === 'success' ? 'checkmark-circle' : 'information-circle');
    const accentColor = variant === 'danger' ? '#EF6C6C' : variant === 'success' ? '#6CEF8A' : '#D3A77A';
    const iconBg = variant === 'danger' ? 'bg-[#4A2F2F]' : variant === 'success' ? 'bg-[#2C3B29]' : 'bg-[#3E3A35]';
    const iconBorder = variant === 'danger' ? 'border-[#663A3A]' : variant === 'success' ? 'border-[#3A6648]' : 'border-[#5D5A54]';

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                <View className="bg-[#383633] rounded-[28px] p-7 mx-8 border-[1.5px] border-[#4E4B47] w-[85%] max-w-[340px]">
                    <View className="items-center mb-5">
                        <View className={`w-16 h-16 ${iconBg} border ${iconBorder} rounded-full items-center justify-center`}>
                            <Ionicons name={iconName} size={28} color={accentColor} />
                        </View>
                    </View>
                    <Text className="text-[#F2EFEB] text-xl font-black text-center mb-2">{title}</Text>
                    <Text className="text-[#A7A4A0] text-sm text-center leading-5 mb-7">{message}</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="py-4 rounded-2xl items-center"
                        style={{ backgroundColor: accentColor }}
                        activeOpacity={0.7}
                    >
                        <Text className="text-[#2B231A] font-extrabold text-sm">{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
