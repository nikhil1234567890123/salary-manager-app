/**
 * SMS Reader Service (Android Only)
 *
 * Handles SMS permission requests and reading SMS messages.
 *
 * ⚠️  IMPORTANT: Expo does not include a built-in SMS reading API.
 * This file provides a MOCK implementation that simulates SMS reading
 * for development and testing purposes.
 *
 * For PRODUCTION use, replace the mock with:
 *   - `react-native-get-sms-android` (community native module)
 *   - Or a custom Expo config plugin with a native module
 *   - Requires an Expo development build (not Expo Go)
 *
 * The public API is stable — just swap the internal implementation.
 */

import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RawSmsMessage } from '@/models/detectedTransaction';

const STORAGE_KEYS = {
    SMS_PERMISSION_GRANTED: '@sms_permission_granted',
    LAST_SMS_SCAN: '@last_sms_scan_timestamp',
};

// ─── Permission Handling ──────────────────────────────────────────

/**
 * Check if SMS permission has been previously granted.
 * Always returns false on non-Android platforms.
 */
export async function hasSmsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    const granted = await AsyncStorage.getItem(STORAGE_KEYS.SMS_PERMISSION_GRANTED);
    return granted === 'true';
}

/**
 * Request SMS read permission from the user.
 * Shows an explanation dialog before requesting.
 *
 * Returns true if permission is granted.
 * Always returns false on non-Android platforms.
 */
export async function requestSmsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    return new Promise<boolean>((resolve) => {
        Alert.alert(
            'SMS Access Required',
            'We read bank transaction SMS messages to automatically track your expenses. ' +
            'Only financial transaction messages are processed. ' +
            'Your SMS content is never stored or shared.',
            [
                {
                    text: 'Deny',
                    style: 'cancel',
                    onPress: () => {
                        AsyncStorage.setItem(STORAGE_KEYS.SMS_PERMISSION_GRANTED, 'false');
                        resolve(false);
                    },
                },
                {
                    text: 'Allow',
                    onPress: async () => {
                        // ─── MOCK: Simulate granting permission ───────────────
                        // In production, this would call:
                        //   import { PermissionsAndroid } from 'react-native';
                        //   const result = await PermissionsAndroid.request(
                        //     PermissionsAndroid.PERMISSIONS.READ_SMS,
                        //   );
                        //   const granted = result === PermissionsAndroid.RESULTS.GRANTED;
                        // ──────────────────────────────────────────────────────

                        const granted = true; // Mock: always grant for dev
                        await AsyncStorage.setItem(
                            STORAGE_KEYS.SMS_PERMISSION_GRANTED,
                            granted ? 'true' : 'false'
                        );
                        resolve(granted);
                    },
                },
            ],
            { cancelable: false }
        );
    });
}

// ─── SMS Reading ──────────────────────────────────────────────────

/**
 * Get the timestamp of the last SMS scan.
 * Returns 0 if never scanned.
 */
export async function getLastScanTimestamp(): Promise<number> {
    const ts = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SMS_SCAN);
    return ts ? parseInt(ts, 10) : 0;
}

/**
 * Update the last scan timestamp to now.
 */
export async function updateLastScanTimestamp(): Promise<void> {
    await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_SMS_SCAN,
        Date.now().toString()
    );
}

/**
 * Read recent SMS messages since the given timestamp.
 *
 * ⚠️  MOCK IMPLEMENTATION — returns sample bank SMS messages.
 * In production, this would use a native module to read the SMS inbox.
 *
 * @param sinceTimestamp - Only return messages newer than this (ms epoch)
 * @returns Array of raw SMS messages
 */
export async function readRecentSms(
    sinceTimestamp: number = 0
): Promise<RawSmsMessage[]> {
    if (Platform.OS !== 'android') return [];

    const hasPermission = await hasSmsPermission();
    if (!hasPermission) return [];

    // ─── MOCK DATA ────────────────────────────────────────────
    // These simulate real bank SMS messages for testing.
    // Replace this section with actual native SMS reading.
    const now = Date.now();
    const mockMessages: RawSmsMessage[] = [
        {
            body: 'INR 250 spent on UPI at Swiggy on 05-03-26. Avl Bal: INR 12,450.00. Ref: 123456789',
            address: 'AD-HDFCBK',
            timestamp: now - 3600000, // 1 hour ago
        },
        {
            body: 'Rs 1200 debited from your account ending XX1234 for Amazon Pay. UPI Ref: 987654321',
            address: 'VD-ICICIB',
            timestamp: now - 7200000, // 2 hours ago
        },
        {
            body: '₹450 paid to Uber via UPI on 05-03-26. Balance: ₹11,000.00',
            address: 'JD-SBIBNK',
            timestamp: now - 10800000, // 3 hours ago
        },
        {
            body: 'Rs.320.00 was debited from A/c XX5678 to Zomato. IMPS Ref 456789123. Avl Bal Rs.10,680.00',
            address: 'BZ-AXISBK',
            timestamp: now - 14400000, // 4 hours ago
        },
        {
            body: 'Dear Customer, INR 180 has been debited from your account for Ola ride. Ref: OLA123456',
            address: 'AD-KOTKBK',
            timestamp: now - 18000000, // 5 hours ago
        },
    ];

    // Filter by sinceTimestamp (simulates "only new messages")
    return mockMessages.filter((msg) => msg.timestamp > sinceTimestamp);
    // ──────────────────────────────────────────────────────────
}
