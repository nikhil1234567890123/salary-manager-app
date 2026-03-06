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
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SmsAndroid from 'react-native-get-sms-android';
import { RawSmsMessage } from '@/models/detectedTransaction';

const STORAGE_KEYS = {
    SMS_PERMISSION_GRANTED: '@sms_permission_granted',
    LAST_SMS_SCAN: '@last_sms_scan_timestamp',
    SIMULATED_SMS_QUEUE: '@simulated_sms_queue',
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
                        try {
                            const result = await PermissionsAndroid.request(
                                PermissionsAndroid.PERMISSIONS.READ_SMS,
                                {
                                    title: "SMS Access Required",
                                    message: "We need SMS access to automatically track your expenses.",
                                    buttonNeutral: "Ask Me Later",
                                    buttonNegative: "Cancel",
                                    buttonPositive: "OK"
                                }
                            );
                            const granted = result === PermissionsAndroid.RESULTS.GRANTED;

                            await AsyncStorage.setItem(
                                STORAGE_KEYS.SMS_PERMISSION_GRANTED,
                                granted ? 'true' : 'false'
                            );
                            resolve(granted);
                        } catch (err) {
                            console.warn(err);
                            resolve(false);
                        }
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
 * Add a simulated SMS message to the queue.
 * This is used for the "Manual Paste" and "Simulation Mode" features.
 */
export async function simulateIncomingSms(body: string, address: string = 'BANK-SMS'): Promise<void> {
    try {
        const queueStr = await AsyncStorage.getItem(STORAGE_KEYS.SIMULATED_SMS_QUEUE);
        const queue: RawSmsMessage[] = queueStr ? JSON.parse(queueStr) : [];

        const newMessage: RawSmsMessage = {
            body,
            address,
            timestamp: Date.now(),
        };

        await AsyncStorage.setItem(
            STORAGE_KEYS.SIMULATED_SMS_QUEUE,
            JSON.stringify([newMessage, ...queue])
        );
    } catch (error) {
        console.error('[SmsReader] Failed to simulate SMS:', error);
    }
}

/**
 * Clear all simulated messages.
 */
export async function clearSimulatedSms(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SIMULATED_SMS_QUEUE);
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

    return new Promise(async (resolve) => {
        try {
            // First read simulated messages (these always work)
            const queueStr = await AsyncStorage.getItem(STORAGE_KEYS.SIMULATED_SMS_QUEUE);
            const simulated: RawSmsMessage[] = queueStr ? JSON.parse(queueStr) : [];
            const newSimulated = simulated.filter((msg) => msg.timestamp > sinceTimestamp);

            // If we are in Expo Go or SmsAndroid is not linked properly, it might be undefined/null
            if (!SmsAndroid || !SmsAndroid.list) {
                console.log("[SmsReader] Native SMS module not available (likely Expo Go). Using simulated only.");
                return resolve(newSimulated);
            }

            // Read from native SMS inbox
            const filter = {
                box: 'inbox',
                minDate: sinceTimestamp > 0 ? sinceTimestamp : Date.now() - (7 * 24 * 60 * 60 * 1000), // Max 7 days back if 0
            };

            SmsAndroid.list(
                JSON.stringify(filter),
                (fail: string) => {
                    console.error("[SmsReader] Failed to list SMS:", fail);
                    resolve(newSimulated); // Fallback to simulated
                },
                (count: number, smsListStr: string) => {
                    try {
                        const smsList = JSON.parse(smsListStr);
                        const rawMessages: RawSmsMessage[] = smsList.map((sms: any) => ({
                            body: sms.body,
                            address: sms.address,
                            timestamp: parseInt(sms.date, 10),
                        }));

                        // Filter specifically for likely bank messages
                        const bankMessages = rawMessages.filter(msg => {
                            if (!msg.address) return false;
                            const addr = msg.address.toUpperCase();
                            return /[A-Z]{2}-[A-Z0-9]+/.test(addr) || /^[A-Z0-9]+$/.test(addr);
                        });

                        // Combine native + simulated
                        const allMessages = [...newSimulated, ...bankMessages];
                        // Double check timestamps since we might have added raw messages
                        resolve(allMessages.filter((msg) => msg.timestamp > sinceTimestamp));

                    } catch (e) {
                        console.error("[SmsReader] Parsing SMS failed:", e);
                        resolve(newSimulated); // Fallback
                    }
                }
            );
        } catch (globalErr) {
            console.error("[SmsReader] Unexpected error reading SMS:", globalErr);
            resolve([]);
        }
    });
}
