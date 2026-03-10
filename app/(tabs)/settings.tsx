import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import { useRouter } from "expo-router";
import { useFinance } from '@/context/FinanceContext';
import { StatusBar } from "expo-status-bar";
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedScrollHandler
} from "react-native-reanimated";
import ConfirmDialog, { AlertDialog } from '@/components/ConfirmDialog';
import { PremiumBackground3D } from '@/components/PremiumBackground3D';
import { useSettings } from '@/store/settingsStore';
import { exportCSV } from '@/utils/exportReport';
import { useAppTheme } from '@/hooks/useAppTheme';
import ThemeSelector from '@/components/ThemeSelector';

export default function SettingsScreen() {
    const { settings, updateSetting, toggleTheme } = useSettings();
    const router = useRouter();
    const { resetMonth, expenses } = useFinance();
    const theme = useAppTheme();

    // Dialog state
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showResetDone, setShowResetDone] = useState(false);

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const handleResetMonth = () => {
        setShowResetConfirm(true);
    };

    const confirmReset = async () => {
        setShowResetConfirm(false);
        await resetMonth();
        setShowResetDone(true);
    };

    const handleExport = async () => {
        await exportCSV(expenses);
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
            <StatusBar style={theme.isDark ? "light" : "dark"} />

            <PremiumBackground3D scrollY={scrollY} />

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                className="flex-1 px-6 pt-16 pb-6"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(600)} className="mb-8">
                    <View>
                        <Text className="font-medium text-sm tracking-wider uppercase mb-1" style={{ color: theme.colors.textSecondary }}>Preferences</Text>
                        <Text className="text-[28px] font-black" style={{ color: theme.colors.text }}>Settings</Text>
                    </View>
                </Animated.View>

                {/* Theme Selector UI */}
                <Animated.View entering={FadeInDown.duration(600).delay(50)}>
                    <ThemeSelector />
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                    <Text className="font-bold text-xs uppercase tracking-widest mb-4 ml-1" style={{ color: theme.colors.textSecondary }}>General</Text>

                    <View className="rounded-[24px] border overflow-hidden mb-8" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                        <TouchableOpacity
                            onPress={() => router.push('/salary-setup')}
                            className="flex-row items-center justify-between p-5 border-b"
                            style={{ borderBottomColor: theme.colors.border }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                                    <Ionicons name="pencil" size={18} color={theme.colors.primary} />
                                </View>
                                <Text className="font-semibold text-base" style={{ color: theme.colors.text }}>Edit Salary Setup</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.icon} />
                        </TouchableOpacity>

                        <View className="flex-row items-center justify-between p-5 border-b" style={{ borderBottomColor: theme.colors.border }}>
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                                    <Ionicons name="chatbubbles" size={18} color={theme.colors.primary} />
                                </View>
                                <Text className="font-semibold text-base" style={{ color: theme.colors.text }}>Auto Expense Detect</Text>
                            </View>
                            <Switch
                                value={settings.autoExpenseDetection}
                                onValueChange={(val) => updateSetting('autoExpenseDetection', val)}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                thumbColor={settings.autoExpenseDetection ? theme.colors.background : theme.colors.textSecondary}
                            />
                        </View>

                        <View className="flex-row items-center justify-between p-5 border-b" style={{ borderBottomColor: theme.colors.border }}>
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                                    <Ionicons name="notifications" size={18} color={theme.colors.primary} />
                                </View>
                                <Text className="font-semibold text-base" style={{ color: theme.colors.text }}>Spending Alerts</Text>
                            </View>
                            <Switch
                                value={settings.spendingAlerts}
                                onValueChange={(val) => updateSetting('spendingAlerts', val)}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                thumbColor={settings.spendingAlerts ? theme.colors.background : theme.colors.textSecondary}
                            />
                        </View>

                        <View className="flex-row items-center justify-between p-5 border-b" style={{ borderBottomColor: theme.colors.border }}>
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                                    <Ionicons name="lock-closed" size={18} color={theme.colors.primary} />
                                </View>
                                <Text className="font-semibold text-base" style={{ color: theme.colors.text }}>App Lock</Text>
                            </View>
                            <Switch
                                value={settings.appLockEnabled}
                                onValueChange={(val) => updateSetting('appLockEnabled', val)}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                thumbColor={settings.appLockEnabled ? theme.colors.background : theme.colors.textSecondary}
                            />
                        </View>

                        <View className="flex-row items-center justify-between p-5 border-b" style={{ borderBottomColor: theme.colors.border }}>
                            <View className="flex-row items-center flex-1 mr-3">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                                    <Ionicons name="shield-checkmark" size={18} color={theme.colors.success} />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-semibold text-base" style={{ color: theme.colors.text }}>Offline Privacy</Text>
                                    {settings.offlinePrivacyMode && (
                                        <Text className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: theme.colors.success }}>Local Data Only</Text>
                                    )}
                                </View>
                            </View>
                            <Switch
                                value={settings.offlinePrivacyMode}
                                onValueChange={(val) => updateSetting('offlinePrivacyMode', val)}
                                trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                                thumbColor={settings.offlinePrivacyMode ? theme.colors.background : theme.colors.textSecondary}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleExport}
                            className="flex-row items-center justify-between p-5 border-b"
                            style={{ borderBottomColor: theme.colors.border }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                                    <Ionicons name="download" size={18} color={theme.colors.primary} />
                                </View>
                                <Text className="font-semibold text-base" style={{ color: theme.colors.text }}>Export Report</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.icon} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleResetMonth}
                            className="flex-row items-center justify-between p-5"
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-4 border" style={{ backgroundColor: `${theme.colors.danger}20`, borderColor: `${theme.colors.danger}40` }}>
                                    <Ionicons name="refresh" size={18} color={theme.colors.danger} />
                                </View>
                                <Text className="font-semibold text-base" style={{ color: theme.colors.danger }}>Reset Month</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    <Text className="font-bold text-xs uppercase tracking-widest mb-4 ml-1" style={{ color: theme.colors.textSecondary }}>About</Text>

                    <View className="rounded-[24px] border overflow-hidden mb-12" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                        <TouchableOpacity className="flex-row items-center justify-between p-5 border-b" style={{ borderBottomColor: theme.colors.border }}>
                            <Text className="font-medium" style={{ color: theme.colors.text }}>Privacy Policy</Text>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center justify-between p-5 border-b" style={{ borderBottomColor: theme.colors.border }}>
                            <Text className="font-medium" style={{ color: theme.colors.text }}>Terms of Service</Text>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.icon} />
                        </TouchableOpacity>
                        <View className="flex-row items-center justify-between p-5" style={{ backgroundColor: theme.colors.background }}>
                            <Text className="font-medium" style={{ color: theme.colors.textSecondary }}>App Version</Text>
                            <Text className="font-bold" style={{ color: theme.colors.icon }}>1.0.0</Text>
                        </View>
                    </View>
                </Animated.View>
                <View className="h-10" />
            </Animated.ScrollView>

            {/* Custom styled dialogs */}
            <ConfirmDialog
                visible={showResetConfirm}
                title="Reset Month"
                message="This will clear all expenses for the current month. Are you sure?"
                confirmText="Reset"
                cancelText="Cancel"
                variant="danger"
                icon="refresh"
                onConfirm={confirmReset}
                onCancel={() => setShowResetConfirm(false)}
            />

            <AlertDialog
                visible={showResetDone}
                title="Done ✅"
                message="All expenses have been cleared successfully."
                buttonText="OK"
                variant="success"
                onClose={() => setShowResetDone(false)}
            />
        </View>
    );
}
