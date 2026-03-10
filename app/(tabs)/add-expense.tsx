import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '@/context/FinanceContext';
import { AlertDialog } from '@/components/ConfirmDialog';
import { formatCurrency } from '@/utils/formatters';
import { useAppTheme } from '@/hooks/useAppTheme';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler
} from 'react-native-reanimated';
import { PremiumBackground3D } from '@/components/PremiumBackground3D';

const CATEGORIES = {
    income: ['Salary', 'Freelance', 'Gift', 'Investment', 'Other Income'],
    expense: ['Food', 'Transport', 'Shopping', 'Rent', 'Bills', 'Entertainment', 'Health', 'General']
};

export default function AddTransactionScreen() {
    const router = useRouter();
    const { addTransaction } = useFinance();
    const theme = useAppTheme();

    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('General');
    const [note, setNote] = useState('');
    const [showSavedAlert, setShowSavedAlert] = useState(false);
    const [savedAmount, setSavedAmount] = useState(0);

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const handleSave = async () => {
        const parsedAmount = parseFloat(amount.replace(/,/g, ''));
        if (!parsedAmount || parsedAmount <= 0) return;

        await addTransaction({
            type,
            amount: parsedAmount,
            category,
            note: note || '',
            source: 'manual',
            date: new Date().getTime(),
        });

        setSavedAmount(parsedAmount);
        setShowSavedAlert(true);
    };

    const toggleType = (newType: 'income' | 'expense') => {
        setType(newType);
        setCategory(newType === 'income' ? 'Salary' : 'General');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: theme.colors.background }}
        >
            <PremiumBackground3D scrollY={scrollY} />

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                className="flex-1 px-6 pt-12 pb-8"
            >
                <View className="flex-row justify-between items-center mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: theme.colors.card }}
                    >
                        <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold" style={{ color: theme.colors.text }}>Add Transaction</Text>
                </View>

                {/* Type Selector */}
                <View className="flex-row p-1 rounded-2xl mb-10" style={{ backgroundColor: theme.colors.card }}>
                    <TouchableOpacity
                        onPress={() => toggleType('expense')}
                        className="flex-1 py-3 rounded-xl items-center"
                        style={{ backgroundColor: type === 'expense' ? theme.colors.primary : 'transparent' }}
                    >
                        <Text className="font-bold" style={{ color: type === 'expense' ? theme.colors.background : theme.colors.textSecondary }}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => toggleType('income')}
                        className="flex-1 py-3 rounded-xl items-center"
                        style={{ backgroundColor: type === 'income' ? theme.colors.primary : 'transparent' }}
                    >
                        <Text className="font-bold" style={{ color: type === 'income' ? theme.colors.background : theme.colors.textSecondary }}>Income</Text>
                    </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View className="items-center mb-10">
                    <Text className="font-medium mb-2 uppercase tracking-widest text-[10px]" style={{ color: theme.colors.textSecondary }}>Amount</Text>
                    <View className="flex-row items-center justify-center">
                        <Text className="text-4xl font-bold mr-2" style={{ color: theme.colors.primary }}>₹</Text>
                        <TextInput
                            className="text-6xl font-bold min-w-[150px] text-center"
                            style={{ color: theme.colors.text }}
                            placeholder="0"
                            placeholderTextColor={theme.colors.border}
                            keyboardType="numeric"
                            autoFocus={true}
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>
                </View>

                {/* Category Selector */}
                <Text className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: theme.colors.textSecondary }}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-10">
                    {(type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setCategory(cat)}
                            className="mr-3 px-5 py-3 rounded-2xl border"
                            style={{
                                backgroundColor: category === cat ? theme.colors.text : 'transparent',
                                borderColor: category === cat ? theme.colors.text : theme.colors.border
                            }}
                        >
                            <Text className="font-bold" style={{ color: category === cat ? theme.colors.background : theme.colors.textSecondary }}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Note Input */}
                <View className="rounded-3xl p-5 mb-10 border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                    <Text className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: theme.colors.textSecondary }}>Note (Optional)</Text>
                    <TextInput
                        className="text-lg py-2"
                        style={{ color: theme.colors.text }}
                        placeholder="What was this for?"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={note}
                        onChangeText={setNote}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!amount}
                    className="w-full py-5 rounded-[24px] mb-10"
                    style={{ backgroundColor: !amount ? theme.colors.card : theme.colors.primary }}
                >
                    <Text className="text-center font-bold text-xl" style={{ color: amount ? theme.colors.background : theme.colors.textSecondary }}>
                        Save {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                </TouchableOpacity>
            </Animated.ScrollView>

            <AlertDialog
                visible={showSavedAlert}
                title="Transaction Saved! 🏙️"
                message={`₹${formatCurrency(savedAmount)} ${type} has been added to your cityscape.`}
                buttonText="View City"
                variant="success"
                onClose={() => {
                    setShowSavedAlert(false);
                    router.back();
                }}
            />
        </KeyboardAvoidingView>
    );
}
