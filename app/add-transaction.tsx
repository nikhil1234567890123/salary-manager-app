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

const CATEGORIES = {
    income: ['Salary', 'Freelance', 'Gift', 'Investment', 'Other Income'],
    expense: ['Food', 'Transport', 'Shopping', 'Rent', 'Bills', 'Entertainment', 'Health', 'General']
};

export default function AddTransactionScreen() {
    const router = useRouter();
    const { addTransaction } = useFinance();

    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('General');
    const [note, setNote] = useState('');
    const [showSavedAlert, setShowSavedAlert] = useState(false);
    const [savedAmount, setSavedAmount] = useState(0);

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
            className="flex-1 bg-[#1A1917]"
        >
            <ScrollView className="flex-1 px-6 pt-12 pb-8">
                <View className="flex-row justify-between items-center mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-[#383633] items-center justify-center rounded-full"
                    >
                        <Ionicons name="close" size={24} color="#A7A4A0" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-white">Add Transaction</Text>
                    <View className="w-10" />
                </View>

                {/* Type Selector */}
                <View className="flex-row bg-[#383633] p-1 rounded-2xl mb-10">
                    <TouchableOpacity
                        onPress={() => toggleType('expense')}
                        className={`flex-1 py-3 rounded-xl items-center ${type === 'expense' ? 'bg-[#FF4B4B]' : ''}`}
                    >
                        <Text className={`font-bold ${type === 'expense' ? 'text-white' : 'text-[#A7A4A0]'}`}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => toggleType('income')}
                        className={`flex-1 py-3 rounded-xl items-center ${type === 'income' ? 'bg-[#4BFF4B]' : ''}`}
                    >
                        <Text className={`font-bold ${type === 'income' ? 'text-white' : 'text-[#A7A4A0]'}`}>Income</Text>
                    </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View className="items-center mb-10">
                    <Text className="text-[#A7A4A0] font-medium mb-2 uppercase tracking-widest text-[10px]">Amount</Text>
                    <View className="flex-row items-center justify-center">
                        <Text className={`text-4xl font-bold mr-2 ${type === 'income' ? 'text-[#4BFF4B]' : 'text-[#FF4B4B]'}`}>₹</Text>
                        <TextInput
                            className="text-6xl font-bold text-white min-w-[150px] text-center"
                            placeholder="0"
                            placeholderTextColor="#383633"
                            keyboardType="numeric"
                            autoFocus={true}
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>
                </View>

                {/* Category Selector */}
                <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-4">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-10">
                    {(type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setCategory(cat)}
                            className={`mr-3 px-5 py-3 rounded-2xl border ${category === cat ? 'bg-white border-white' : 'bg-transparent border-[#383633]'}`}
                        >
                            <Text className={`font-bold ${category === cat ? 'text-[#1A1917]' : 'text-[#A7A4A0]'}`}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Note Input */}
                <View className="bg-[#383633] rounded-3xl p-5 mb-10 border border-[#4E4B47]">
                    <Text className="text-[#A7A4A0] text-[10px] font-bold uppercase tracking-widest mb-2">Note (Optional)</Text>
                    <TextInput
                        className="text-white text-lg py-2"
                        placeholder="What was this for?"
                        placeholderTextColor="#4E4B47"
                        value={note}
                        onChangeText={setNote}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!amount}
                    className={`w-full py-5 rounded-[24px] mb-10 ${amount ? (type === 'income' ? 'bg-[#4BFF4B]' : 'bg-[#FF4B4B]') : 'bg-[#383633]'}`}
                >
                    <Text className={`text-center font-bold text-xl ${amount ? 'text-[#1A1917]' : 'text-[#4E4B47]'}`}>
                        Save {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

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
