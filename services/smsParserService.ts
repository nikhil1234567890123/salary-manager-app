/**
 * SMS Parser Service
 *
 * Parses raw SMS messages into structured DetectedTransaction objects.
 * Uses regex patterns from transactionRegex.ts, merchant mapping
 * from merchantCategoryMap.ts, and learned mappings from
 * merchantLearningService.ts.
 */

import { DetectedTransaction, RawSmsMessage } from '@/models/detectedTransaction';
import { parseTransactionSms } from '@/utils/transactionRegex';
import { detectCategory, normalizedMerchantName, scanBodyForMerchant } from '@/utils/merchantCategoryMap';
import { lookupLearnedMerchant } from '@/services/merchantLearningService';

/** Default merchant name when detection fails */
const UNKNOWN_MERCHANT = 'Unknown Transaction';
/** Default category when merchant is unknown */
const UNKNOWN_CATEGORY = 'Other';

/**
 * Generate a deterministic transaction ID from amount + merchant + timestamp.
 * Used for deduplication.
 */
function generateTransactionId(
    amount: number,
    merchant: string,
    timestamp: number
): string {
    // Round timestamp to the nearest minute to handle slight variations
    const roundedTs = Math.floor(timestamp / 60000) * 60000;
    const raw = `${amount}-${merchant.toLowerCase()}-${roundedTs}`;

    // Simple hash (djb2 algorithm)
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) + hash + raw.charCodeAt(i)) & 0xffffffff;
    }
    return `tx_${Math.abs(hash).toString(36)}`;
}

/**
 * Parse a single SMS message into a DetectedTransaction.
 *
 * Resolution order for merchant name:
 *   1. Regex-extracted merchant → check against known database
 *   2. Scan FULL SMS body for any known brand name (Netflix, Swiggy, etc.)
 *   3. Merchant learning system (user-corrected patterns)
 *   4. Use the raw regex-extracted merchant name as-is (even if not in database)
 *   5. Fallback → "Unknown Transaction" with isUnknown=true
 *
 * @param sms - Raw SMS message
 * @returns DetectedTransaction if the SMS is a valid bank debit, null otherwise
 */
export async function parseSingleSms(sms: RawSmsMessage): Promise<DetectedTransaction | null> {
    const parsed = parseTransactionSms(sms.body, sms.timestamp);
    if (!parsed) {
        return null;
    }

    let merchant: string;
    let category: string;
    let isUnknown = false;

    // Step 1: Try regex-extracted merchant → known database
    const normalizedStatic = parsed.merchant
        ? normalizedMerchantName(parsed.merchant) || null
        : null;

    if (normalizedStatic) {
        // Found a known brand from the regex-extracted merchant name
        merchant = normalizedStatic;
        category = detectCategory(merchant);
        console.log('[SmsParser] Merchant resolved via regex+database:', merchant, '→', category);
    } else {
        // Step 2: Scan FULL SMS body for any known brand name
        // e.g., SMS says "Netflix" somewhere → we pick it up
        const bodyMatch = scanBodyForMerchant(sms.body);

        if (bodyMatch) {
            merchant = bodyMatch.merchant;
            category = bodyMatch.category;
            console.log('[SmsParser] Merchant found by scanning SMS body:', merchant, '→', category);
        } else {
            // Step 3: Try merchant learning system (user corrections)
            const learned = await lookupLearnedMerchant(sms.address, parsed.amount);

            if (learned) {
                merchant = learned.merchant;
                category = learned.category;
                console.log('[SmsParser] Merchant resolved via learning system:', merchant);
            } else if (parsed.merchant) {
                // Step 4: Use the raw regex-extracted merchant name as-is
                // e.g., "WARDEN BOYS HOST" — not in our database but still a valid name
                merchant = parsed.merchant;
                category = detectCategory(merchant); // Try to categorize, defaults to 'Other'
                isUnknown = false; // We DO have a name, just not in our known list
                console.log('[SmsParser] Using raw merchant name from SMS:', merchant, '→', category);
            } else {
                // Step 5: Fallback — truly unknown transaction
                merchant = UNKNOWN_MERCHANT;
                category = UNKNOWN_CATEGORY;
                isUnknown = true;
                console.log('[SmsParser] No merchant detected, marking as Unknown.');
            }
        }
    }

    // Generate dedup ID (use raw amount + timestamp for unknowns to stay unique)
    const dedupKey = isUnknown ? `unknown_${parsed.amount}` : merchant;
    const id = generateTransactionId(parsed.amount, dedupKey, sms.timestamp);

    // Create snippet (first 80 chars of SMS body for user context)
    const snippet = sms.body.length > 80
        ? sms.body.substring(0, 80) + '…'
        : sms.body;

    return {
        id,
        amount: parsed.amount,
        merchant,
        category,
        type: 'debit',
        date: parsed.date,
        timestamp: sms.timestamp,
        source: 'sms',
        isUnknown,
        snippet,
        smsAddress: sms.address,
    };
}

/**
 * Parse multiple SMS messages and return all valid transactions.
 *
 * @param messages - Array of raw SMS messages
 * @returns Array of detected transactions (already deduped by ID within the batch)
 */
export async function parseSmsBatch(messages: RawSmsMessage[]): Promise<DetectedTransaction[]> {
    const seen = new Set<string>();
    const results: DetectedTransaction[] = [];

    for (const sms of messages) {
        const transaction = await parseSingleSms(sms);
        if (transaction && !seen.has(transaction.id)) {
            seen.add(transaction.id);
            results.push(transaction);
        }
    }

    // Sort by timestamp descending (newest first)
    return results.sort((a, b) => b.timestamp - a.timestamp);
}
