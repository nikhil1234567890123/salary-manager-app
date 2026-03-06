import { SettingsService } from './settingsService';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Detect if running in Expo Go
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Lazy load expo-notifications to avoid Push-related errors in Expo Go at boot
let notificationsHandlerSet = false;
const getNotifications = () => {
    // CRITICAL: In SDK 54, even requiring expo-notifications in Expo Go can trigger a 
    // FATAL crash because it internally tries to register push token listeners.
    // We must bypass the require entirely in Expo Go.
    if (isExpoGo) {
        return {
            setNotificationHandler: () => { },
            getPermissionsAsync: async () => ({ status: 'undetermined' }),
            requestPermissionsAsync: async () => ({ status: 'denied' }),
            scheduleNotificationAsync: async () => 'mock-id',
            SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' }
        };
    }

    try {
        const Notifications = require('expo-notifications');

        if (!notificationsHandlerSet) {
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: false,
                    shouldShowBanner: true,
                    shouldShowList: true,
                }),
            });
            notificationsHandlerSet = true;
        }
        return Notifications;
    } catch (error) {
        console.error("[Notifications] Failed to initialize:", error);
        return null;
    }
};

/**
 * Request notification permissions from the user.
 */
export const requestNotificationPermission = async () => {
    try {
        const Notifications = getNotifications();
        if (!Notifications) return false;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        return finalStatus === 'granted';
    } catch (error) {
        console.error("[Notifications] Permission request failed:", error);
        return false;
    }
};

/**
 * Send an immediate local notification.
 */
export const sendNotification = async (title: string, body: string, data: object = {}) => {
    try {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) return;

        const Notifications = getNotifications();
        if (!Notifications) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: null, // immediate
        });
    } catch (error) {
        console.error("[Notifications] Failed to send notification:", error);
    }
};

/**
 * Schedule a local notification after a delay (in seconds).
 */
export const scheduleNotification = async (title: string, body: string, seconds: number, data: object = {}) => {
    try {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) return;

        const Notifications = getNotifications();
        if (!Notifications) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds,
            } as any, // Cast to avoid complex type issues with require()
        });
    } catch (error) {
        console.error("[Notifications] Failed to schedule notification:", error);
    }
};

/**
 * Specific alert for detected expenses.
 */
export const triggerExpenseDetected = async (amount: number, merchant: string) => {
    await sendNotification(
        "💸 Expense Detected",
        `₹${amount} spent at ${merchant}. Tap to confirm.`
    );
};

/**
 * Specific alert for automatically added expenses.
 */
export const triggerExpenseAutoAdded = async (amount: number, merchant: string) => {
    await sendNotification(
        "✨ Expense Auto-Added",
        `₹${amount} spent at ${merchant} has been automatically recorded.`
    );
};

/**
 * Specific alert for overspending based on daily limit.
 */
export const checkAndTriggerOverspendingAlert = async (spentToday: number, dailySafeSpend: number) => {
    try {
        const settings = await SettingsService.loadSettings();
        if (!settings.spendingAlerts) return;

        if (spentToday > dailySafeSpend) {
            await sendNotification(
                "⚠️ Overspending Alert",
                `You have exceeded your safe daily limit. Spent today: ₹${spentToday}. Limit: ₹${dailySafeSpend}`
            );
        }
    } catch (error) {
        console.error("[Notifications] Failed to trigger overspending alert:", error);
    }
};

/**
 * Test function for delayed notification.
 */
export const testDelayedNotification = async () => {
    await scheduleNotification(
        "🧪 Test Alert",
        "This is a simulated background alert (5s delay)",
        5
    );
};
