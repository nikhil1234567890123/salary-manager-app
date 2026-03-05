import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFinance } from '@/context/FinanceContext';
import { AlertDialog } from '@/components/ConfirmDialog';
import { formatCurrency } from '@/utils/formatters';

export default function AddExpenseScreen() {
    const router = useRouter();
    const { addExpense } = useFinance();
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
            className="flex-1 bg-white"
        >
            <View className="flex-1 px-6 pt-12 pb-8">
                <View className="flex-row justify-between items-center mb-10">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-50 items-center justify-center rounded-full">
                        <IconSymbol name="xmark" size={20} color="#64748b" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900">Add Expense</Text>
                    <View className="w-10" /> {/* Spacer */}
                </View>

                <View className="items-center mb-10">
                    <Text className="text-slate-400 font-medium mb-2 uppercase tracking-wide">Amount</Text>
                    <View className="flex-row items-center justify-center">
                        <Text className="text-4xl font-bold text-slate-400 mr-2 mt-1">₹</Text>
                        <TextInput
                            className="text-6xl font-bold text-slate-900 min-w-[120px] text-center"
                            placeholder="0"
                            placeholderTextColor="#cbd5e1"
                            keyboardType="numeric"
                            autoFocus={true}
                            value={amount}
                            onChangeText={setAmount}
                            maxLength={7}
                        />
                    </View>
                </View>

                <View className="bg-slate-50 rounded-2xl p-4 mb-auto border border-slate-100">
                    <Text className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Note (Optional)</Text>
                    <TextInput
                        className="text-slate-900 text-base py-2"
                        placeholder="What was this for?"
                        placeholderTextColor="#94a3b8"
                        value={note}
                        onChangeText={setNote}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!amount}
                    className={`w-full py-4 rounded-2xl shadow-sm ${amount ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-200 shadow-transparent'}`}
                >
                    <Text className="text-white text-center font-bold text-lg">Save Expense</Text>
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

