import { SettingsService } from './settingsService';

// Lazy load expo-notifications to avoid Push-related errors in Expo Go at boot
let notificationsHandlerSet = false;
const getNotifications = () => {
    const Notifications = require('expo-notifications');
    if (!notificationsHandlerSet) {
        try {
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
        } catch (error) {
            console.warn("[Notifications] Setup deferred or failed:", error);
        }
    }
    return Notifications;
};

/**
 * Request notification permissions from the user.
 */
export const requestNotificationPermission = async () => {
    try {
        const Notifications = getNotifications();
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
        `₹${amount} spent at ${merchant}`
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
