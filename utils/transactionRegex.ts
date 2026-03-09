/**
 * Regex-based extraction of transaction details from bank SMS messages.
 *
 * Handles ALL common Indian bank SMS formats including:
 *   SBI:     "Dear UPI user A/C X8003 debited by 4973.00 on date 12Feb26 trf to WARDEN BOYS HOST"
 *   HDFC:    "INR 250.00 spent on your HDFC Bank Card ending 1234 at SWIGGY"
 *   ICICI:   "Rs 1200 debited from your ICICI Bank Acct XX1234"
 *   Paytm:   "₹450 paid to Uber via Paytm UPI"
 *   UPI:     "Your UPI-Mandate is successful. A/c X1234 debited INR 299.00"
 *   AXIS:    "Rs.1,200.50 was debited from A/c ending 5678"
 *   KOTAK:   "Amount INR 2,500.00 has been debited from A/c XX1234"
 *   BOB:     "Your BOB A/c debited for Rs.500 on 05/03/26 Ref 12345"
 *   PNB:     "Your A/C ****1234 has been debited with Rs 1000"
 *   Generic: "Transaction of Rs 500 at Amazon"
 */

export interface ParsedAmount {
    amount: number;
    /** Start index in the original string */
    matchIndex: number;
}

export interface ParsedTransaction {
    amount: number;
    merchant: string | null;
    type: 'debit' | 'credit';
    date: string;
}

// ─── Amount Patterns ──────────────────────────────────────────────
// These patterns extract the monetary value from SMS text.
// Ordered from most specific to least specific.
const AMOUNT_PATTERNS: RegExp[] = [
    // With currency symbol: ₹450, INR 250, Rs 1200, Rs.1,200.50
    /(?:₹|Rs\.?\s?|INR\.?\s?)\s?(\d+(?:,\d+)*(?:\.\d{1,2})?)/gi,
    // After amount: 1200 INR, 450₹
    /(\d+(?:,\d+)*(?:\.\d{1,2})?)\s?(?:₹|Rs\.?|INR)/gi,
    // After keyword: "debited by 4973.00", "debited with Rs 1000", "debited for Rs.500"
    /(?:debited by|debited with|debited for|debited|spent|paid|withdrawn|deducted|charged|amount|amt|trf of|txn of|transaction of)\s*(?:rs\.?|inr|₹)?\s*:?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/gi,
];

// ─── Debit Keywords ───────────────────────────────────────────────
// Comprehensive list of ALL ways Indian banks say "money went out"
const DEBIT_KEYWORDS = /\b(spent|debited|deducted|paid|withdrawn|purchase|charged|used at|transferred|spent on|paid to|debited from|debited by|debited with|debited for|trf to|transfer to|sent to|payment|successful|completed|done|processed|transaction|txn|mandate|auto.?pay|emi|bill.?pay|a\/c\s+\S+\s+debited)\b/i;

// ─── Credit Keywords (to EXCLUDE) ─────────────────────────────────
// If these words appear AND no debit keywords appear, skip the SMS
const CREDIT_KEYWORDS = /\b(credited|received|refund|cashback|reversal|credit|salary credited|money received|deposit)\b/i;

// ─── Merchant Patterns ────────────────────────────────────────────
// "at Swiggy", "to Uber", "paid to Amazon", "trf to WARDEN BOYS HOST"
const MERCHANT_PATTERNS: RegExp[] = [
    /(?:at|to|paid to|@|trf to|transfer to|sent to|paying)\s+([A-Za-z][A-Za-z0-9\s&'.-]{1,30}?)(?:\s+on|\s+ref|\s+via|\s+date|\s+Ref|\s*\.|$)/i,
    /(?:towards|for)\s+([A-Za-z][A-Za-z0-9\s&'.-]{1,30}?)(?:\s+on|\s+ref|\s*\.|$)/i,
    /UPI[-/]([A-Za-z][A-Za-z0-9]{1,20})/i,
    // "Refno" pattern — try to get merchant before Refno
    /trf to\s+([A-Za-z][A-Za-z0-9\s&'.-]{1,30}?)\s+Refno/i,
];

// ─── Non-merchant noise words to filter out ───────────────────────
const NOISE_WORDS = new Set([
    'your', 'account', 'bank', 'card', 'a/c', 'ac', 'acct',
    'ending', 'no', 'number', 'ref', 'txn', 'transaction',
    'upi', 'imps', 'neft', 'rtgs', 'on', 'the', 'from', 'dear',
    'customer', 'avl', 'bal', 'balance', 'is', 'was', 'has', 'been',
    'sbi', 'icici', 'hdfc', 'axis', 'trf', 'by', 'user', 'dear',
    'mandate', 'successful', 'completed',
]);

/**
 * Extract the monetary amount from an SMS body.
 */
export function extractAmount(text: string): ParsedAmount | null {
    for (const pattern of AMOUNT_PATTERNS) {
        // Reset lastIndex for global regexes
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            if (match[1]) {
                const raw = match[1].replace(/,/g, '');
                const amount = parseFloat(raw);
                // Ignore phone numbers, dates, ref numbers (usually > 6 digits without decimal)
                if (!isNaN(amount) && amount > 0 && amount < 10_000_000) {
                    return { amount, matchIndex: match.index };
                }
            }
        }
    }

    // Fallback: Find any standalone decimal number (like 4973.00)
    // Only use if we already know it's a debit from context
    const fallbackPattern = /\b(\d+(?:,\d+)*(?:\.\d{2}))\b/g;
    let match;
    while ((match = fallbackPattern.exec(text)) !== null) {
        if (match[1]) {
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
 * Detect whether the SMS describes a debit/outgoing transaction.
 *
 * Uses a two-pass approach:
 *   1. If explicit CREDIT keywords are found and NO debit keywords → skip
 *   2. If ANY debit keyword is found → it's a debit
 *   3. If the SMS has an amount + a/c pattern but no clear credit → treat as debit
 */
export function isDebitTransaction(text: string): boolean {
    const hasDebitKw = DEBIT_KEYWORDS.test(text);
    const hasCreditKw = CREDIT_KEYWORDS.test(text);

    // Clear debit keyword found → yes
    if (hasDebitKw) return true;

    // Only credit keywords found → not a debit
    if (hasCreditKw) return false;

    // Ambiguous: SMS has an account reference + amount pattern but
    // no clear debit/credit keyword. These are usually bank alerts
    // about money going out. Treat as debit if it looks financial.
    const hasAccountRef = /\b(a\/c|acct?|account|card)\b/i.test(text);
    const hasAmount = extractAmount(text) !== null;

    return hasAccountRef && hasAmount;
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
 * Returns null if the SMS is not a recognizable transaction.
 *
 * Strategy: Try amount extraction first. If we find an amount,
 * then check if it's a credit or debit.
 *
 * @param body     - SMS text
 * @param timestamp - SMS timestamp in ms (used to derive the date)
 */
export function parseTransactionSms(
    body: string,
    timestamp: number
): ParsedTransaction | null {
    console.log('[SmsParser] Analyzing body:', body.substring(0, 50) + '...');

    // Step 1: Try to extract an amount
    const amountResult = extractAmount(body);
    if (!amountResult) {
        console.log('[SmsParser] FAILED: No valid amount found.');
        return null;
    }

    // Step 2: Determine transaction type
    const hasCreditKw = CREDIT_KEYWORDS.test(body);
    const hasDebitKw = DEBIT_KEYWORDS.test(body);

    let type: 'debit' | 'credit';

    if (hasCreditKw && !hasDebitKw) {
        type = 'credit';
    } else if (hasDebitKw) {
        type = 'debit';
    } else if (isDebitTransaction(body)) {
        // Fallback for ambiguous bank messages
        type = 'debit';
    } else {
        console.log('[SmsParser] FAILED: Could not determine transaction type.');
        return null;
    }

    console.log(`[SmsParser] SUCCESS: ${type} amount extracted:`, amountResult.amount);

    // Step 3: Try to extract merchant (optional – will fall back to "Unknown")
    const merchant = extractMerchant(body);
    if (merchant) {
        console.log('[SmsParser] Merchant detected:', merchant);
    } else {
        console.log('[SmsParser] No merchant detected, will use Fallback.');
    }

    // Derive date from timestamp
    const dateObj = new Date(timestamp);
    const date = dateObj.toISOString().split('T')[0];

    return {
        amount: amountResult.amount,
        merchant,
        type,
        date,
    };
}
