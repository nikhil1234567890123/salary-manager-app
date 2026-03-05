/**
 * Merchant Learning Service
 *
 * Learns merchant names from user corrections. When the user edits
 * "Unknown Transaction" → "Petrol Pump", the mapping is stored so
 * that future SMS messages with the same sender/pattern are
 * automatically assigned the correct merchant and category.
 *
 * Storage format (AsyncStorage):
 *   key: @merchant_learnings
 *   value: MerchantLearning[]
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { detectCategory } from '@/utils/merchantCategoryMap';

const STORAGE_KEY = '@merchant_learnings';

/** Maximum number of learned mappings to store */
const MAX_LEARNINGS = 200;

/** A single learned merchant mapping */
export interface MerchantLearning {
    /** The SMS sender address pattern (e.g. "AD-HDFCBK") */
    smsAddress: string;
    /** Amount pattern (rounded to nearest 10) — helps narrow matches */
    amountBucket: number;
    /** The user-corrected merchant name */
    merchant: string;
    /** The user-corrected category */
    category: string;
    /** When this mapping was last used / updated (ms epoch) */
    lastUsed: number;
    /** How many times this mapping was confirmed */
    confirmCount: number;
}

// ─── In-Memory Cache ──────────────────────────────────────────────

let _cache: MerchantLearning[] | null = null;

/**
 * Load all learned mappings from AsyncStorage.
 */
async function loadLearnings(): Promise<MerchantLearning[]> {
    if (_cache !== null) return _cache;

    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        _cache = data ? JSON.parse(data) : [];
    } catch (e) {
        console.warn('[MerchantLearning] Failed to load:', e);
        _cache = [];
    }
    return _cache!;
}

/**
 * Save all learned mappings to AsyncStorage.
 */
async function saveLearnings(learnings: MerchantLearning[]): Promise<void> {
    // Keep only the most recent MAX_LEARNINGS entries
    if (learnings.length > MAX_LEARNINGS) {
        learnings.sort((a, b) => b.lastUsed - a.lastUsed);
        learnings = learnings.slice(0, MAX_LEARNINGS);
    }

    _cache = learnings;

    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(learnings));
    } catch (e) {
        console.warn('[MerchantLearning] Failed to save:', e);
    }
}

/**
 * Bucket an amount for fuzzy matching.
 * Rounds to the nearest 10 to allow slight variations.
 */
function bucketAmount(amount: number): number {
    return Math.round(amount / 10) * 10;
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Learn a new merchant mapping from user correction.
 *
 * Called when the user edits "Unknown Transaction" to a real merchant name.
 *
 * @param smsAddress  - The SMS sender address (e.g. "AD-HDFCBK")
 * @param amount      - The transaction amount
 * @param merchant    - The user-corrected merchant name
 * @param category    - The user-corrected category
 */
export async function learnMerchant(
    smsAddress: string,
    amount: number,
    merchant: string,
    category: string
): Promise<void> {
    const learnings = await loadLearnings();
    const bucket = bucketAmount(amount);

    // Check if a matching learning already exists
    const existingIdx = learnings.findIndex(
        (l) => l.smsAddress === smsAddress && l.amountBucket === bucket
    );

    if (existingIdx >= 0) {
        // Update existing learning
        learnings[existingIdx].merchant = merchant;
        learnings[existingIdx].category = category;
        learnings[existingIdx].lastUsed = Date.now();
        learnings[existingIdx].confirmCount += 1;
    } else {
        // Add new learning
        learnings.push({
            smsAddress,
            amountBucket: bucket,
            merchant,
            category,
            lastUsed: Date.now(),
            confirmCount: 1,
        });
    }

    await saveLearnings(learnings);
}

/**
 * Look up a previously learned merchant for a given SMS pattern.
 *
 * @param smsAddress - The SMS sender address
 * @param amount     - The transaction amount
 * @returns The learned merchant + category, or null if not found
 */
export async function lookupLearnedMerchant(
    smsAddress: string,
    amount: number
): Promise<{ merchant: string; category: string } | null> {
    const learnings = await loadLearnings();
    const bucket = bucketAmount(amount);

    // First try exact match (address + amount bucket)
    const exact = learnings.find(
        (l) => l.smsAddress === smsAddress && l.amountBucket === bucket
    );
    if (exact) {
        return { merchant: exact.merchant, category: exact.category };
    }

    // Fallback: match by address only (if the user has confirmed this sender multiple times)
    const addressMatches = learnings.filter(
        (l) => l.smsAddress === smsAddress && l.confirmCount >= 2
    );
    if (addressMatches.length > 0) {
        // Use the most recently used mapping from this address
        const best = addressMatches.sort((a, b) => b.lastUsed - a.lastUsed)[0];
        return { merchant: best.merchant, category: best.category };
    }

    return null;
}

/**
 * Look up a merchant by name across all learnings.
 * Useful for auto-detecting category when the merchant name is known
 * but not in the static merchantCategoryMap.
 *
 * @param merchantName - The merchant name to look up
 * @returns The learned category, or falls back to detectCategory()
 */
export async function lookupCategoryForMerchant(merchantName: string): Promise<string> {
    const learnings = await loadLearnings();
    const lower = merchantName.toLowerCase();

    const match = learnings.find(
        (l) => l.merchant.toLowerCase() === lower
    );

    if (match) {
        return match.category;
    }

    // Fall back to the static mapping
    return detectCategory(merchantName);
}

/**
 * Get all unique learned merchants (for autocomplete / suggestions).
 */
export async function getAllLearnedMerchants(): Promise<string[]> {
    const learnings = await loadLearnings();
    const unique = new Set(learnings.map((l) => l.merchant));
    return Array.from(unique).sort();
}

/**
 * Clear all learned merchant data.
 * Useful for testing or privacy reset.
 */
export async function clearAllLearnings(): Promise<void> {
    _cache = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
}
