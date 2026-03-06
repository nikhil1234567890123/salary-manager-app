import { parseTransactionSms } from './utils/transactionRegex';

const sms = "Dear UPI user A/C X8003 debited by 4973.00 on date 12Feb26 trf to WARDEN BOYS HOST Refno 604390979543 If not u? call-1800111109 for other services-18001234-SBI";

const res = parseTransactionSms(sms, Date.now());
console.log(res);
