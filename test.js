// Self-contained test — copies logic from transactionRegex.ts 

const AMOUNT_PATTERNS = [
    /(?:₹|Rs\.?\s?|INR\.?\s?)\s?(\d+(?:,\d+)*(?:\.\d{1,2})?)/gi,
    /(\d+(?:,\d+)*(?:\.\d{1,2})?)\s?(?:₹|Rs\.?|INR)/gi,
    /(?:debited by|debited with|debited for|debited|spent|paid|withdrawn|deducted|charged|amount|amt|trf of|txn of|transaction of)\s*(?:rs\.?|inr|₹)?\s*:?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/gi,
];

const DEBIT_KEYWORDS = /\b(spent|debited|deducted|paid|withdrawn|purchase|charged|used at|transferred|spent on|paid to|debited from|debited by|debited with|debited for|trf to|transfer to|sent to|payment|successful|completed|done|processed|transaction|txn|mandate|auto.?pay|emi|bill.?pay|a\/c\s+\S+\s+debited)\b/i;
const CREDIT_KEYWORDS = /\b(credited|received|refund|cashback|reversal|credit|salary credited|money received|deposit)\b/i;

const MERCHANT_PATTERNS = [
    /(?:at|to|paid to|@|trf to|transfer to|sent to|paying)\s+([A-Za-z][A-Za-z0-9\s&'.-]{1,30}?)(?:\s+on|\s+ref|\s+via|\s+date|\s+Ref|\s*\.|$)/i,
    /(?:towards|for)\s+([A-Za-z][A-Za-z0-9\s&'.-]{1,30}?)(?:\s+on|\s+ref|\s*\.|$)/i,
    /UPI[-\/]([A-Za-z][A-Za-z0-9]{1,20})/i,
    /trf to\s+([A-Za-z][A-Za-z0-9\s&'.-]{1,30}?)\s+Refno/i,
];

function extractAmount(text) {
    for (const pattern of AMOUNT_PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            if (match[1]) {
                const raw = match[1].replace(/,/g, '');
                const amount = parseFloat(raw);
                if (!isNaN(amount) && amount > 0 && amount < 10000000) {
                    return { amount, matchIndex: match.index };
                }
            }
        }
    }
    const fallbackPattern = /\b(\d+(?:,\d+)*(?:\.\d{2}))\b/g;
    let match;
    while ((match = fallbackPattern.exec(text)) !== null) {
        if (match[1]) {
            const raw = match[1].replace(/,/g, '');
            const amount = parseFloat(raw);
            if (!isNaN(amount) && amount > 0 && amount < 10000000) {
                return { amount, matchIndex: match.index };
            }
        }
    }
    return null;
}

function isDebitTransaction(text) {
    const hasDebitKw = DEBIT_KEYWORDS.test(text);
    const hasCreditKw = CREDIT_KEYWORDS.test(text);
    if (hasDebitKw) return true;
    if (hasCreditKw) return false;
    const hasAccountRef = /\b(a\/c|acct?|account|card)\b/i.test(text);
    const hasAmount = extractAmount(text) !== null;
    return hasAccountRef && hasAmount;
}

const NOISE = new Set(['your', 'account', 'bank', 'card', 'a/c', 'ac', 'acct', 'ending', 'no', 'number', 'ref', 'txn', 'transaction', 'upi', 'imps', 'neft', 'rtgs', 'on', 'the', 'from', 'dear', 'customer', 'avl', 'bal', 'balance', 'is', 'was', 'has', 'been', 'sbi', 'icici', 'hdfc', 'axis', 'trf', 'by', 'user', 'dear', 'mandate', 'successful', 'completed']);

function extractMerchant(text) {
    for (const pattern of MERCHANT_PATTERNS) {
        pattern.lastIndex = 0;
        const match = pattern.exec(text);
        if (match && match[1]) {
            const cleaned = match[1].trim();
            const words = cleaned.split(/\s+/);
            const meaningful = words.filter(w => !NOISE.has(w.toLowerCase()) && w.length > 1);
            if (meaningful.length > 0) return meaningful.join(' ');
        }
    }
    return null;
}

function parseTransactionSms(body, timestamp) {
    const hasCreditKw = CREDIT_KEYWORDS.test(body);
    const hasDebitKw = DEBIT_KEYWORDS.test(body);
    if (hasCreditKw && !hasDebitKw) return null;
    const amountResult = extractAmount(body);
    if (!amountResult) return null;
    if (!isDebitTransaction(body)) return null;
    const merchant = extractMerchant(body);
    const dateObj = new Date(timestamp);
    const date = dateObj.toISOString().split('T')[0];
    return { amount: amountResult.amount, merchant, type: 'debit', date };
}

// ─── Test Cases ───────────────────────────────────────────────────
const testCases = [
    { sms: "Dear UPI user A/C X8003 debited by 4973.00 on date 12Feb26 trf to WARDEN BOYS HOST Refno 604390979543 If not u? call-1800111109 for other services-18001234-SBI", expect: true },
    { sms: "Your UPI-Mandate is successful. A/c X1234 debited INR 299.00 on 05Mar26. If not done by you call 1800111109-SBI", expect: true },
    { sms: "INR 250.00 spent on your HDFC Bank Card ending 1234 at SWIGGY on 2026-03-05", expect: true },
    { sms: "Dear Customer, Rs 1200 debited from your ICICI Bank Acct XX1234 on 05-03-26 for UPI trf to AMAZON", expect: true },
    { sms: "₹450 paid to Uber via Paytm UPI. Ref: 123456789.", expect: true },
    { sms: "Rs.1,200.50 was debited from A/c ending 5678 on 05Mar26 for NEFT to FLIPKART PAYMENTS", expect: true },
    { sms: "Amount INR 2,500.00 has been debited from your Kotak A/c XX1234 on 05/03/26. Avl Bal: INR 15,000.00", expect: true },
    { sms: "Your BOB A/c debited for Rs.500 on 05/03/26. Trf to RELIANCE JIO. Ref 12345", expect: true },
    { sms: "Your A/C ****1234 has been debited with Rs 1000 on 05/03/26. IMPS to GOOGLE PAY. Txn ID: 456789", expect: true },
    { sms: "Payment of Rs 350 successful to ZOMATO via UPI. Ref 987654.", expect: true },
    { sms: "Auto-pay: Rs 5999 debited from A/c XX5678 towards EMI for BAJAJ FINANCE.", expect: true },
    // Should SKIP
    { sms: "Rs 500 credited to your A/c XX1234. Refund from AMAZON. Avl Bal: Rs 15,500", expect: false },
    { sms: "Congratulations! Rs 50 cashback credited to your Paytm wallet.", expect: false },
    { sms: "Your OTP is 123456. Do not share with anyone. Valid for 10 minutes.", expect: false },
];

console.log("=== TRANSACTION SMS PARSER TEST ===\n");
let passed = 0; let failed = 0;

testCases.forEach((tc, i) => {
    const result = parseTransactionSms(tc.sms, Date.now());
    const detected = result !== null;
    const ok = detected === tc.expect;
    if (ok) passed++; else failed++;

    console.log(`${ok ? '✅' : '🔴'} Test ${i + 1}: ${tc.sms.substring(0, 55)}...`);
    if (detected) {
        console.log(`   → ₹${result.amount} | Merchant: ${result.merchant || 'Unknown'}`);
    } else {
        console.log(`   → SKIPPED (not a debit)`);
    }
    if (!ok) console.log(`   ⚠️ EXPECTED: ${tc.expect ? 'DETECTED' : 'SKIPPED'}`);
    console.log('');
});

console.log(`\n=== RESULTS: ${passed}/${testCases.length} passed, ${failed} failed ===`);
