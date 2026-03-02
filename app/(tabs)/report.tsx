import { View, Text, ScrollView } from "react-native";
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ReportScreen() {
    // Mock Data
    const salary = 40000;
    const spent = 15500;
    const saved = 24500;
    const overspendDays = 3;
    const healthScore = 85;

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 px-6 pt-16 pb-6">
                <Text className="text-2xl font-bold text-slate-900 mb-6">Financial Health</Text>

                {/* Health Score Card */}
                <View className="bg-indigo-600 rounded-3xl p-6 shadow-sm shadow-indigo-300 mb-6 items-center">
                    <View className="w-24 h-24 rounded-full border-4 border-indigo-400 items-center justify-center mb-4">
                        <Text className="text-3xl font-bold text-white">{healthScore}</Text>
                    </View>
                    <Text className="text-indigo-100 font-medium text-center">Excellent discipline this month!</Text>
                </View>

                <Text className="text-lg font-bold text-slate-900 mb-4">Summary</Text>

                <View className="space-y-3 mb-8">
                    {/* Summary Items */}
                    <View className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-100 border border-slate-100 flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3">
                                <IconSymbol name="briefcase.fill" size={18} color="#64748b" />
                            </View>
                            <Text className="text-slate-600 font-medium">Total Salary</Text>
                        </View>
                        <Text className="text-slate-900 font-bold text-lg">₹ {salary.toLocaleString()}</Text>
                    </View>

                    <View className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-100 border border-slate-100 flex-row justify-between items-center mt-3">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mr-3">
                                <IconSymbol name="arrow.down.right" size={18} color="#ef4444" />
                            </View>
                            <Text className="text-slate-600 font-medium">Total Spent</Text>
                        </View>
                        <Text className="text-red-600 font-bold text-lg">₹ {spent.toLocaleString()}</Text>
                    </View>

                    <View className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-100 border border-slate-100 flex-row justify-between items-center mt-3">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3">
                                <IconSymbol name="arrow.up.right" size={18} color="#10b981" />
                            </View>
                            <Text className="text-slate-600 font-medium">Currently Saved</Text>
                        </View>
                        <Text className="text-green-600 font-bold text-lg">₹ {saved.toLocaleString()}</Text>
                    </View>
                </View>

                <Text className="text-lg font-bold text-slate-900 mb-4">Insights</Text>

                <View className="bg-white rounded-2xl p-5 shadow-sm shadow-slate-100 border border-slate-100 flex-row items-start mb-4">
                    <View className="w-10 h-10 bg-amber-50 rounded-full items-center justify-center mr-4 mt-1">
                        <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#f59e0b" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-slate-900 font-semibold mb-1">Overspent Days: {overspendDays}</Text>
                        <Text className="text-slate-500 text-sm leading-5">
                            You exceeded your daily limit {overspendDays} times this month. Try cooking at home tomorrow to balance it out.
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
