import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface ProgressChartProps {
    totalSpent: number;
    totalSaved: number;
    remainingBalance: number;
}

const screenWidth = Dimensions.get('window').width;

export default function ProgressChart({ totalSpent, totalSaved, remainingBalance }: ProgressChartProps) {
    const chartData = {
        labels: ['Spent', 'Saved', 'Remaining'],
        datasets: [
            {
                data: [totalSpent, totalSaved, Math.max(remainingBalance, 0)],
            },
        ],
    };

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // indigo
        labelColor: () => '#6b7280',
        barPercentage: 0.6,
        decimalPlaces: 0,
        propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: '#f3f4f6',
        },
    };

    return (
        <View className="bg-white rounded-3xl p-5 shadow-md border border-gray-100" style={{ elevation: 3 }}>
            <Text className="text-gray-800 font-bold text-lg mb-1">Spending vs Savings</Text>
            <Text className="text-gray-400 text-xs mb-4">Your financial progress this month</Text>

            <BarChart
                data={chartData}
                width={screenWidth - 72}
                height={200}
                chartConfig={chartConfig}
                style={{ borderRadius: 16 }}
                fromZero
                showValuesOnTopOfBars
                yAxisLabel="₹"
                yAxisSuffix=""
            />

            {/* Legend */}
            <View className="flex-row justify-around mt-4">
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-red-400 mr-2" />
                    <Text className="text-gray-600 text-xs font-medium">Spent: ₹{totalSpent.toLocaleString()}</Text>
                </View>
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-emerald-400 mr-2" />
                    <Text className="text-gray-600 text-xs font-medium">Saved: ₹{totalSaved.toLocaleString()}</Text>
                </View>
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-indigo-400 mr-2" />
                    <Text className="text-gray-600 text-xs font-medium">Left: ₹{Math.max(remainingBalance, 0).toLocaleString()}</Text>
                </View>
            </View>
        </View>
    );
}
