import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function SalarySetupScreen() {
    const router = useRouter();
    const [salary, setSalary] = useState("");
    const [fixedExpenses, setFixedExpenses] = useState("");
    const [savingsGoal, setSavingsGoal] = useState("");

    // Calculations
    const salaryNum = parseFloat(salary) || 0;
    const fixedExpensesNum = parseFloat(fixedExpenses) || 0;
    const savingsNum = savingsGoal ? (parseFloat(savingsGoal) || 0) : (salaryNum * 0.2); // Default 20%
    const balanceAfterFixed = salaryNum - fixedExpensesNum - savingsNum;
    const dailySafeSpend = balanceAfterFixed > 0 ? Math.floor(balanceAfterFixed / 30) : 0; // Approx 30 days

    return (
        <View className="flex-1 bg-gray-50 px-6 pt-16">
            <Text className="text-2xl font-bold text-slate-900 mb-2">Setup Your Month</Text>
            <Text className="text-slate-500 mb-8">Let's calculate your daily safe spending limit.</Text>

            <View className="space-y-4 mb-8">
                <View className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-100 border border-slate-100">
                    <Text className="text-sm font-medium text-slate-500 mb-2">Monthly Salary</Text>
                    <View className="flex-row items-center border-b border-slate-200 pb-2">
                        <Text className="text-xl font-semibold text-slate-900 mr-2">₹</Text>
                        <TextInput
                            className="flex-1 text-xl font-semibold text-slate-900"
                            placeholder="0"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                            value={salary}
                            onChangeText={setSalary}
                        />
                    </View>
                </View>

                <View className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-100 border border-slate-100 mt-4">
                    <Text className="text-sm font-medium text-slate-500 mb-2">Fixed Expenses (Rent, EMI, etc)</Text>
                    <View className="flex-row items-center border-b border-slate-200 pb-2">
                        <Text className="text-xl font-semibold text-slate-900 mr-2">₹</Text>
                        <TextInput
                            className="flex-1 text-xl font-semibold text-slate-900"
                            placeholder="0"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                            value={fixedExpenses}
                            onChangeText={setFixedExpenses}
                        />
                    </View>
                </View>

                <View className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-100 border border-slate-100 mt-4">
                    <Text className="text-sm font-medium text-slate-500 mb-2">Target Savings (Optional)</Text>
                    <View className="flex-row items-center border-b border-slate-200 pb-2">
                        <Text className="text-xl font-semibold text-slate-900 mr-2">₹</Text>
                        <TextInput
                            className="flex-1 text-xl font-semibold text-slate-900"
                            placeholder={`${salaryNum ? Math.floor(salaryNum * 0.2) : "0"} (Default 20%)`}
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                            value={savingsGoal}
                            onChangeText={setSavingsGoal}
                        />
                    </View>
                </View>
            </View>

            <View className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 items-center mt-2">
                <Text className="text-indigo-600 font-medium mb-1">Your Daily Safe Spend</Text>
                <Text className="text-4xl font-bold text-indigo-700">₹ {dailySafeSpend}</Text>
            </View>

            <TouchableOpacity
                onPress={() => router.replace("/(tabs)")}
                className={`absolute bottom-12 left-6 right-6 px-6 py-4 rounded-2xl shadow-sm ${salaryNum > 0 ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-300 shadow-transparent'}`}
                disabled={salaryNum <= 0}
            >
                <Text className="text-white text-center font-semibold text-lg">
                    Continue
                </Text>
            </TouchableOpacity>
        </View>
    );
}
