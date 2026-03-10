import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

interface ExpenseFormProps {
    onSubmit: (expense: { amount: number; category: string; note: string; date: string }) => void;
}

const CATEGORIES = [
    { label: 'Food', icon: 'fast-food-outline' as const, color: '#f97316' },
    { label: 'Transport', icon: 'car-outline' as const, color: '#3b82f6' },
    { label: 'Shopping', icon: 'bag-outline' as const, color: '#ec4899' },
    { label: 'Bills', icon: 'flash-outline' as const, color: '#eab308' },
    { label: 'Health', icon: 'medkit-outline' as const, color: '#22c55e' },
    { label: 'Entertainment', icon: 'game-controller-outline' as const, color: '#8b5cf6' },
    { label: 'Education', icon: 'book-outline' as const, color: '#06b6d4' },
    { label: 'Other', icon: 'ellipsis-horizontal-outline' as const, color: '#6b7280' },
];

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
    const theme = useAppTheme();
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [note, setNote] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);

    const handleSubmit = () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Select Category', 'Please select an expense category.');
            return;
        }

        onSubmit({
            amount: parseFloat(amount),
            category: selectedCategory,
            note,
            date,
        });

        // Reset form
        setAmount('');
        setSelectedCategory('');
        setNote('');
        setDate(today);
    };

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Amount Input */}
            <View className="mb-6">
                <Text className="font-bold text-sm uppercase tracking-wider mb-2" style={{ color: theme.colors.textSecondary }}>
                    Amount (₹)
                </Text>
                <View className="rounded-2xl flex-row items-center px-5 py-1 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                    <Text className="font-bold text-xl mr-2" style={{ color: theme.colors.danger }}>₹</Text>
                    <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="decimal-pad"
                        className="flex-1 text-3xl font-extrabold py-3"
                        style={{ color: theme.colors.text }}
                    />
                </View>
            </View>

            {/* Category Selection */}
            <View className="mb-6">
                <Text className="font-bold text-sm uppercase tracking-wider mb-3" style={{ color: theme.colors.textSecondary }}>
                    Category
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.label;
                        return (
                            <TouchableOpacity
                                key={cat.label}
                                onPress={() => setSelectedCategory(cat.label)}
                                activeOpacity={0.7}
                                className="rounded-2xl px-4 py-3 flex-row items-center border"
                                style={{
                                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                                    borderColor: isSelected ? theme.colors.primary : theme.colors.border
                                }}
                            >
                                <Ionicons
                                    name={cat.icon}
                                    size={16}
                                    color={isSelected ? theme.colors.background : cat.color}
                                />
                                <Text
                                    className="ml-2 font-semibold text-sm"
                                    style={{ color: isSelected ? theme.colors.background : theme.colors.textSecondary }}
                                >
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Note Input */}
            <View className="mb-6">
                <Text className="font-bold text-sm uppercase tracking-wider mb-2" style={{ color: theme.colors.textSecondary }}>
                    Note (optional)
                </Text>
                <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="e.g. Coffee with friends"
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    numberOfLines={2}
                    className="rounded-2xl px-5 py-4 text-base border"
                    style={{ backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }}
                />
            </View>

            {/* Date Input */}
            <View className="mb-8">
                <Text className="font-bold text-sm uppercase tracking-wider mb-2" style={{ color: theme.colors.textSecondary }}>
                    Date
                </Text>
                <TextInput
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.colors.textSecondary}
                    className="rounded-2xl px-5 py-4 text-base border"
                    style={{ backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }}
                />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.8}
                className="rounded-2xl py-4 items-center justify-center shadow-lg mb-8"
                style={{
                    backgroundColor: theme.colors.primary,
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                }}
            >
                <View className="flex-row items-center">
                    <Ionicons name="add-circle-outline" size={22} color={theme.colors.background} />
                    <Text className="font-bold text-lg ml-2" style={{ color: theme.colors.background }}>Add Expense</Text>
                </View>
            </TouchableOpacity>
        </ScrollView>
    );
}
