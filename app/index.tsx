import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function SplashScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-gray-50 items-center justify-center px-6">
            <View className="items-center mb-12">
                {/* Simple Abstract Logo placeholder */}
                <View className="w-20 h-20 bg-indigo-600 rounded-3xl items-center justify-center mb-6 shadow-sm shadow-indigo-200">
                    <Text className="text-white text-4xl font-bold">₹</Text>
                </View>
                <Text className="text-3xl font-bold text-slate-900 tracking-tight">
                    Salary Manager
                </Text>
                <Text className="text-slate-500 mt-3 text-center text-base">
                    Manage your salary. Control your future.
                </Text>
            </View>

            <TouchableOpacity
                onPress={() => router.push("/salary-setup")}
                className="absolute bottom-12 bg-indigo-600 px-6 py-4 rounded-2xl w-full shadow-sm shadow-indigo-200"
            >
                <Text className="text-white text-center font-semibold text-lg">
                    Get Started
                </Text>
            </TouchableOpacity>
        </View>
    );
}
