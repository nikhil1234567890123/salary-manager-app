/**
 * Regex-based extraction of transaction details from bank SMS messages.
 *
 * Handles common Indian bank SMS formats:
 *   "INR 250 spent on UPI at Swiggy"
 *   "Rs 1200 debited from your account"
 *   "₹450 paid to Uber"
 *   "Rs.1,200.50 was debited"
 *   "Dear Customer, INR 2,500.00 has been debited from A/c XX1234 on 05-03-26"
 */

export interface ParsedAmount {
    amount: number;
    /** Start index in the original string */
    matchIndex: number;
}

export interface ParsedTransaction {
    amount: number;
    merchant: string | null;
    type: 'debit';
    date: string;
}

// ─── Amount Patterns ──────────────────────────────────────────────
// Matches: ₹450, INR 250, Rs 1200, Rs.1,200.50, INR 2,500.00
const AMOUNT_PATTERNS: RegExp[] = [
    /(?:₹|Rs\.?|INR)\s?(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/gi,
    /(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)\s?(?:₹|Rs\.?|INR)/gi,
];

// ─── Debit Keywords ───────────────────────────────────────────────
const DEBIT_KEYWORDS = /\b(spent|debited|deducted|paid|withdrawn|purchase|charged|used at|transferred)\b/i;

// ─── Merchant Patterns ────────────────────────────────────────────
// "at Swiggy", "to Uber", "paid to Amazon", "at merchant Zomato"
const MERCHANT_PATTERNS: RegExp[] = [
    /(?:at|to|paid to|@)\s+([A-Za-z][A-Za-z0-9\s&'.-]{1,30}?)(?:\s+on|\s+ref|\s+via|\s*\.|$)/i,
    /(?:towards|for)\s+([A-Za-z][A-Za-z0-9\s&'.-]{1,30}?)(?:\s+on|\s+ref|\s*\.|$)/i,
    /UPI[-/]([A-Za-z][A-Za-z0-9]{1,20})/i,
];

// ─── Non-merchant noise words to filter out ───────────────────────
const NOISE_WORDS = new Set([
    'your', 'account', 'bank', 'card', 'a/c', 'ac', 'acct',
    'ending', 'no', 'number', 'ref', 'txn', 'transaction',
    'upi', 'imps', 'neft', 'rtgs', 'on', 'the', 'from', 'dear',
    'customer', 'avl', 'bal', 'balance', 'is', 'was', 'has', 'been',
]);

/**
 * Extract the monetary amount from an SMS body.
 */
export function extractAmount(text: string): ParsedAmount | null {
    for (const pattern of AMOUNT_PATTERNS) {
        // Reset lastIndex for global regexes
        pattern.lastIndex = 0;
        const match = pattern.exec(text);
        if (match && match[1]) {
            const raw = match[1].replace(/,/g, '');
            const amount = parseFloat(raw);
            if (!isNaN(amount) && amount > 0 && amount < 10_000_000) {
                return { amount, matchIndex: match.index };
            }
        }
    }
    return null;
}

/**
 * Detect whether the SMS describes a debit transaction.
 */
export function isDebitTransaction(text: string): boolean {
    return DEBIT_KEYWORDS.test(text);
}

/**
 * Extract the merchant/payee name from SMS text.
 */
export function extractMerchant(text: string): string | null {
    for (const pattern of MERCHANT_PATTERNS) {
        pattern.lastIndex = 0;
        const match = pattern.exec(text);
        if (match && match[1]) {
            const cleaned = match[1].trim();
            // Filter out noise
            const words = cleaned.split(/\s+/);
            const meaningful = words.filter(
                (w) => !NOISE_WORDS.has(w.toLowerCase()) && w.length > 1
            );
            if (meaningful.length > 0) {
                return meaningful.join(' ');
            }
        }
    }
    return null;
}

/**
 * Full parse: extract amount, merchant, type from an SMS body.
 * Returns null if the SMS is not a recognizable debit transaction.
 *
 * @param body     - SMS text
 * @param timestamp - SMS timestamp in ms (used to derive the date)
 */
export function parseTransactionSms(
    body: string,
    timestamp: number
): ParsedTransaction | null {
    // Must be a debit
    if (!isDebitTransaction(body)) {
        return null;
    }

    // Must have an amount
    const amountResult = extractAmount(body);
    if (!amountResult) {
        return null;
    }

    // Try to extract merchant (optional – will fall back to "Unknown")
    const merchant = extractMerchant(body);

    // Derive date from timestamp
    const dateObj = new Date(timestamp);
    const date = dateObj.toISOString().split('T')[0];

    return {
        amount: amountResult.amount,
        merchant,
        type: 'debit',
        date,
    };
}
