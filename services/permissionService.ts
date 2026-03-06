import { Platform } from 'react-native';
import { requestNotificationPermission } from './notificationService';
import { requestSmsPermission, hasSmsPermission } from './smsReaderService';

/**
 * Centralized Permission Service
 * 
 * Handles the sequential request of app permissions to ensure a smooth 
 * user experience and prevent multiple dialogs from stacking.
 */
export const PermissionService = {
    /**
     * Request all necessary app permissions in sequence.
     * Call this during app initialization (e.g., in RootLayout).
     */
    requestAllPermissions: async () => {
        console.log('[PermissionService] Starting sequential permission requests...');

        try {
            // 1. Notification Permission (All Platforms)
            // This is less intrusive and common for finance apps.
            const notificationsGranted = await requestNotificationPermission();
            console.log('[PermissionService] Notification permission:', notificationsGranted ? 'GRANTED' : 'DENIED');

            // 2. SMS Permission (Android Only)
            // Only request if auto-detection is expected to be used.
            if (Platform.OS === 'android') {
                const smsGranted = await requestSmsPermission();
                console.log('[PermissionService] SMS permission:', smsGranted ? 'GRANTED' : 'DENIED');
            }

            return {
                notifications: notificationsGranted,
                sms: Platform.OS === 'android' ? await hasSmsPermission() : false,
            };
        } catch (error) {
            console.error('[PermissionService] Error during permission sequence:', error);
            return { notifications: false, sms: false };
        }
    }
};
