/**
 * Duplicate Prevention Service
 *
 * Prevents the same SMS transaction from being added multiple times.
 * Uses AsyncStorage to persist a set of processed transaction hashes.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@processed_transactions';

/** Maximum number of transaction IDs to keep (rolling window) */
const MAX_STORED_IDS = 500;

/**
 * Load the set of processed transaction IDs from storage.
 */
async function loadProcessedIds(): Promise<Set<string>> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
            const arr: string[] = JSON.parse(data);
            return new Set(arr);
        }
    } catch (e) {
        console.warn('[DuplicatePrevention] Failed to load processed IDs', e);
    }
    return new Set();
}

/**
 * Save the set of processed transaction IDs to storage.
 * Keeps only the most recent MAX_STORED_IDS entries.
 */
async function saveProcessedIds(ids: Set<string>): Promise<void> {
    try {
        let arr = Array.from(ids);
        // Keep only the most recent entries if we exceed the limit
        if (arr.length > MAX_STORED_IDS) {
            arr = arr.slice(arr.length - MAX_STORED_IDS);
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
        console.warn('[DuplicatePrevention] Failed to save processed IDs', e);
    }
}

/**
 * Check if a transaction has already been processed.
 *
 * @param transactionId - The unique hash ID of the transaction
 * @returns true if the transaction was already processed
 */
export async function isDuplicate(transactionId: string): Promise<boolean> {
    const ids = await loadProcessedIds();
    return ids.has(transactionId);
}

/**
 * Mark a transaction as processed to prevent future duplicates.
 *
 * @param transactionId - The unique hash ID of the transaction
 */
export async function markProcessed(transactionId: string): Promise<void> {
    const ids = await loadProcessedIds();
    ids.add(transactionId);
    await saveProcessedIds(ids);
}

/**
 * Mark multiple transactions as processed in a single operation.
 * More efficient than calling markProcessed repeatedly.
 *
 * @param transactionIds - Array of unique hash IDs
 */
export async function markBatchProcessed(transactionIds: string[]): Promise<void> {
    const ids = await loadProcessedIds();
    for (const id of transactionIds) {
        ids.add(id);
    }
    await saveProcessedIds(ids);
}

/**
 * Filter out already-processed transactions from a list.
 * Returns only the new, unprocessed transactions.
 *
 * @param transactionIds - Array of transaction IDs to check
 * @returns Array of IDs that have NOT been processed yet
 */
export async function filterNewTransactions(transactionIds: string[]): Promise<string[]> {
    const ids = await loadProcessedIds();
    return transactionIds.filter((id) => !ids.has(id));
}

/**
 * Clear all processed transaction records.
 * Useful for testing or monthly reset.
 */
export async function clearProcessedTransactions(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
}
