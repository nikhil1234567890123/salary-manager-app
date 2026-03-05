/**
 * Expense Detection Service (Android)
 *
 * Orchestrates the full SMS → transaction detection pipeline:
 *   1. Read new SMS messages (since last scan)
 *   2. Parse each SMS for transaction data
 *   3. Filter out duplicates
 *   4. Return new DetectedTransaction[] for user confirmation
 */

import { DetectedTransaction } from '@/models/detectedTransaction';
import { parseSmsBatch } from '@/services/smsParserService';
import {
    hasSmsPermission,
    requestSmsPermission,
    readRecentSms,
    getLastScanTimestamp,
    updateLastScanTimestamp,
} from '@/services/smsReaderService';
import {
    isDuplicate,
    markProcessed,
    filterNewTransactions,
} from '@/services/duplicatePreventionService';
import { SettingsService } from '@/services/settingsService';

/**
 * Run a full SMS scan and return newly detected transactions.
 *
 * Flow:
 *   1. Check/request SMS permission
 *   2. Read SMS since last scan
 *   3. Parse for financial transactions
 *   4. Filter out already-processed duplicates
 *   5. Update last scan timestamp
 *
 * @returns Array of new DetectedTransaction objects (may be empty)
 */
export async function scanForNewTransactions(): Promise<DetectedTransaction[]> {
    // Check if auto-detection is enabled in settings
    const settings = await SettingsService.loadSettings();
    if (!settings.autoExpenseDetection) {
        return [];
    }

    // Ensure we have permission
    const hasPermission = await hasSmsPermission();
    if (!hasPermission) {
        const granted = await requestSmsPermission();
        if (!granted) {
            return [];
        }
    }

    // Read SMS since last scan
    const lastScan = await getLastScanTimestamp();
    const rawMessages = await readRecentSms(lastScan);

    if (rawMessages.length === 0) {
        await updateLastScanTimestamp();
        return [];
    }

    // Parse SMS batch into transactions
    const parsed = await parseSmsBatch(rawMessages);

    if (parsed.length === 0) {
        await updateLastScanTimestamp();
        return [];
    }

    // Filter out duplicates
    const txIds = parsed.map((tx) => tx.id);
    const newIds = await filterNewTransactions(txIds);
    const newTransactions = parsed.filter((tx) => newIds.includes(tx.id));

    // Update the last scan timestamp
    await updateLastScanTimestamp();

    return newTransactions;
}

/**
 * Confirm a detected transaction — marks it as processed.
 * The caller is responsible for actually adding it as an expense via FinanceContext.
 *
 * @param transaction - The transaction to confirm
 */
export async function confirmDetectedTransaction(
    transaction: DetectedTransaction
): Promise<void> {
    await markProcessed(transaction.id);
}

/**
 * Dismiss a detected transaction — marks it as processed
 * without adding it as an expense.
 *
 * @param transaction - The transaction to dismiss
 */
export async function dismissDetectedTransaction(
    transaction: DetectedTransaction
): Promise<void> {
    await markProcessed(transaction.id);
}

/**
 * Check if SMS detection is available on the current platform.
 * Returns true only on Android with permission granted.
 */
export async function isDetectionAvailable(): Promise<boolean> {
    return hasSmsPermission();
}
