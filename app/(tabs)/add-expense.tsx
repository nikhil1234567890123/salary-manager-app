import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFinance } from '@/context/FinanceContext';
import { useImpact } from '@/hooks/useImpact';
import { AlertDialog } from '@/components/ConfirmDialog';

const CATEGORIES = [
    { name: 'Food', icon: 'fast-food-outline' as const },
    { name: 'Transport', icon: 'car-outline' as const },
    { name: 'Shopping', icon: 'bag-outline' as const },
    { name: 'Bills', icon: 'receipt-outline' as const },
    { name: 'Health', icon: 'medkit-outline' as const },
    { name: 'Entertainment', icon: 'game-controller-outline' as const },
    { name: 'Education', icon: 'school-outline' as const },
    { name: 'Other', icon: 'ellipsis-horizontal-outline' as const },
];

export default function AddExpenseScreen() {
    const { addExpense, salary } = useFinance();
    const impact = useImpact();
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [selected, setSelected] = useState('Food');

    // Dialog state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState<'danger' | 'success' | 'default'>('default');
    const [shouldReset, setShouldReset] = useState(false);

    const showAlert = (title: string, message: string, variant: 'danger' | 'success' | 'default', reset = false) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVariant(variant);
        setShouldReset(reset);
        setAlertVisible(true);
    };

    const handleSubmit = async () => {
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            impact.error();
            showAlert('Invalid Amount', 'Please enter a valid expense amount.', 'danger');
            return;
        }
        if (!salary) {
            impact.error();
            showAlert('Setup Required', 'Please set your salary on the Home tab first.', 'default');
            return;
        }

        impact.medium();

        await addExpense({
            amount: parsedAmount,
            category: selected,
            note: note || '',
            date: new Date().toISOString().split('T')[0],
        });

        impact.success();
        showAlert('Saved! ✅', `₹${parsedAmount} for ${selected} recorded.`, 'success', true);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-[#2C2B29]"
        >
            <StatusBar style="light" />

            <ScrollView
                className="flex-1 px-6 pt-16 pb-8"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(600)} className="mb-8">
                    <Text className="text-[#A7A4A0] font-medium text-sm tracking-wider uppercase mb-1">Record</Text>
                    <Text className="text-[28px] font-black text-[#F2EFEB]">Add Expense</Text>
                </Animated.View>

                {/* Amount Input */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)} className="items-center mb-8 bg-[#383633] rounded-[28px] p-8 border border-[#4E4B47]">
                    <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-4">Amount</Text>
                    <View className="flex-row items-center justify-center">
                        <Text className="text-4xl font-bold text-[#A87D56] mr-2">₹</Text>
                        <TextInput
                            className="text-[56px] font-black text-[#D3A77A] min-w-[120px] text-center p-0"
                            placeholder="0"
                            placeholderTextColor="#65625E"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            maxLength={7}
                            selectionColor="#EACFA7"
                        />
                    </View>
                </Animated.View>

                {/* Category Selection */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)} className="mb-6">
                    <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-3 ml-1">Category</Text>
                    <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.name}
                                onPress={() => {
                                    impact.light();
                                    setSelected(cat.name);
                                }}
                                activeOpacity={0.7}
                                className={`flex-row items-center px-4 py-3 rounded-2xl border ${selected === cat.name
                                    ? 'bg-[#D3A77A]/15 border-[#D3A77A]'
                                    : 'bg-[#383633] border-[#4E4B47]'
                                    }`}
                            >
                                <Ionicons
                                    name={cat.icon}
                                    size={16}
                                    color={selected === cat.name ? '#D3A77A' : '#A7A4A0'}
                                />
                                <Text className={`text-sm font-bold ml-2 ${selected === cat.name ? 'text-[#D3A77A]' : 'text-[#A7A4A0]'
                                    }`}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Note Input */}
                <Animated.View entering={FadeInDown.duration(600).delay(300)} className="mb-8">
                    <Text className="text-[#A7A4A0] text-xs font-bold uppercase tracking-widest mb-2 ml-1">Note (Optional)</Text>
                    <View className="bg-[#383633] rounded-2xl px-5 py-4 border border-[#4E4B47]">
                        <TextInput
                            className="text-[#F2EFEB] text-base p-0"
                            placeholder="What was this for?"
                            placeholderTextColor="#65625E"
                            value={note}
                            onChangeText={setNote}
                            selectionColor="#EACFA7"
                        />
                    </View>
                </Animated.View>

                {/* Submit Button */}
                <Animated.View entering={FadeInDown.duration(600).delay(400)}>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!amount}
                        activeOpacity={0.8}
                        className={`rounded-full shadow-lg shadow-black/50 ${!amount ? 'opacity-40' : 'opacity-100'}`}
                        style={{ elevation: amount ? 15 : 0 }}
                    >
                        <View className={`py-5 rounded-full items-center justify-center flex-row ${amount
                            ? 'bg-[#D1A677] border-t border-t-[#EACFA7] border-b border-b-[#A87D56]'
                            : 'bg-[#4E4B47] border border-[#5D5A54]'
                            }`}>
                            <Ionicons name="checkmark-circle" size={20} color={amount ? "#2B231A" : "#A7A4A0"} />
                            <Text className={`font-extrabold text-[15px] tracking-wide ml-2 ${amount ? 'text-[#2B231A]' : 'text-[#A7A4A0]'
                                }`}>
                                Save Expense
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <View className="h-24" />
            </ScrollView>

            <AlertDialog
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                variant={alertVariant}
                buttonText="OK"
                onClose={() => {
                    setAlertVisible(false);
                    if (shouldReset) {
                        setAmount('');
                        setNote('');
                        setSelected('Food');
                        setShouldReset(false);
                    }
                }}
            />
        </KeyboardAvoidingView>
    );
}
