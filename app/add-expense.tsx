import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFinance } from '@/context/FinanceContext';
import { AlertDialog } from '@/components/ConfirmDialog';
import { formatCurrency } from '@/utils/formatters';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function AddExpenseScreen() {
    const router = useRouter();
    const { addExpense } = useFinance();
    const theme = useAppTheme();
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [savedAmount, setSavedAmount] = useState(0);
    const [showSavedAlert, setShowSavedAlert] = useState(false);

    const handleSave = async () => {
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) return;

        await addExpense({
            amount: parsedAmount,
            category: 'General',
            note: note || '',
            date: new Date().toISOString().split('T')[0],
        });

        setSavedAmount(parsedAmount);
        setAmount("");
        setNote("");
        setShowSavedAlert(true);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: theme.colors.background }}
        >
            <View className="flex-1 px-6 pt-12 pb-8">
                <View className="flex-row justify-between items-center mb-10">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.card }}>
                        <IconSymbol name="xmark" size={20} color={theme.colors.icon} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold" style={{ color: theme.colors.text }}>Add Expense</Text>
                    <View className="w-10" /> {/* Spacer */}
                </View>

                <View className="items-center mb-10">
                    <Text className="font-medium mb-2 uppercase tracking-wide" style={{ color: theme.colors.textSecondary }}>Amount</Text>
                    <View className="flex-row items-center justify-center">
                        <Text className="text-4xl font-bold mr-2 mt-1" style={{ color: theme.colors.danger }}>₹</Text>
                        <TextInput
                            className="text-6xl font-bold min-w-[120px] text-center"
                            style={{ color: theme.colors.text }}
                            placeholder="0"
                            placeholderTextColor={theme.colors.textSecondary}
                            keyboardType="numeric"
                            autoFocus={true}
                            value={amount}
                            onChangeText={setAmount}
                            maxLength={7}
                        />
                    </View>
                </View>

                <View className="rounded-2xl p-4 mb-auto border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                    <Text className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: theme.colors.textSecondary }}>Note (Optional)</Text>
                    <TextInput
                        className="text-base py-2"
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
                    className="w-full py-4 rounded-2xl shadow-sm"
                    style={{ backgroundColor: amount ? theme.colors.danger : theme.colors.card }}
                >
                    <Text className="text-center font-bold text-lg" style={{ color: amount ? theme.colors.background : theme.colors.textSecondary }}>Save Expense</Text>
                </TouchableOpacity>
            </View>

            <AlertDialog
                visible={showSavedAlert}
                title="Saved! ✅"
                message={`₹${formatCurrency(savedAmount)} expense recorded.`}
                buttonText="OK"
                variant="success"
                onClose={() => {
                    setShowSavedAlert(false);
                    router.back();
                }}
            />
        </KeyboardAvoidingView>
    );
}

