import { signed } from '../statement/index.js';
/** Small seeded generator (mulberry32) so every run is reproducible. */
export function seededRng(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const int = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
const pick = (rng, items) => items[int(rng, 0, items.length - 1)];
const DEBITS = [
    'POS PURCHASE SARI-SARI MART', 'GRAB RIDE', 'ELECTRIC BILL PAYMENT', 'WATER BILL PAYMENT', 'MOBILE LOAD', 'SEND MONEY TO WALLET',
    'ATM WITHDRAWAL', 'ONLINE SHOPPING', 'COFFEE SHOP', 'FAST FOOD QC', 'PHARMACY', 'GROCERY SUPERMARKET', 'STREAMING SUBSCRIPTION',
    'INTERNET BILL', 'TRANSFER FEE', 'RENT PAYMENT', 'FUEL STATION', 'BOOKSTORE',
];
const CREDITS = ['PAYROLL CREDIT', 'CASH IN', 'RECEIVED MONEY FROM WALLET', 'REFUND', 'INTEREST EARNED', 'FREELANCE PAYMENT'];
/** A clean, internally consistent statement with opening and closing balances. */
export function generateStatement(seed, options = {}) {
    const rng = seededRng(seed);
    const count = options.rows ?? int(rng, 12, 40);
    const withBalance = options.withBalance ?? true;
    const withReference = options.withReference ?? rng() < 0.5;
    const openingMinor = int(rng, 20_000, 400_000) * 100 + int(rng, 0, 99);
    const rows = [];
    let balance = openingMinor;
    let day = int(rng, 1, 5);
    for (let i = 0; i < count; i++) {
        if (rng() < 0.6)
            day = Math.min(28, day + int(rng, 0, 2));
        let direction = rng() < 0.22 ? 'credit' : 'debit';
        // Round amounts are common in real statements and are exactly what makes faults ambiguous.
        const style = rng();
        let amountMinor = style < 0.35 ? int(rng, 1, 60) * 5_000 : style < 0.7 ? int(rng, 2_000, 250_000) : int(rng, 100, 99_999) * 10 + int(rng, 0, 9);
        if (direction === 'credit')
            amountMinor *= int(rng, 2, 12);
        if (direction === 'debit' && balance - amountMinor < 0)
            direction = 'credit';
        const row = {
            line: i + 2,
            date: `2026-09-${String(day).padStart(2, '0')}`,
            description: pick(rng, direction === 'credit' ? CREDITS : DEBITS),
            direction,
            amountMinor,
        };
        balance += signed(row);
        if (withBalance)
            row.balanceAfterMinor = balance;
        if (withReference)
            row.reference = `REF${String(int(rng, 0, 999_999_999)).padStart(9, '0')}`;
        rows.push(row);
    }
    return { account: 'Invented Wallet', currency: options.currency ?? 'PHP', openingMinor, closingMinor: balance, rows };
}
export const FAULT_KINDS = ['missing_row', 'duplicate_row', 'sign_flip', 'transposition', 'decimal_shift', 'digit_substitution', 'compensating'];
/** Extraction output is numbered by where each row lands, so lines are renumbered after a fault. */
const renumber = (rows) => rows.map((r, i) => ({ ...r, line: i + 2 }));
function transposed(amount, rng) {
    const digits = String(amount).split('');
    const spots = [];
    for (let i = 0; i < digits.length - 1; i++) {
        if (digits[i] !== digits[i + 1] && !(i === 0 && digits[i + 1] === '0'))
            spots.push(i);
    }
    if (!spots.length)
        return null;
    const i = pick(rng, spots);
    [digits[i], digits[i + 1]] = [digits[i + 1], digits[i]];
    return Number(digits.join(''));
}
function substituted(amount, rng) {
    const digits = String(amount).split('');
    const i = int(rng, 0, digits.length - 1);
    let d;
    do
        d = int(rng, i === 0 ? 1 : 0, 9);
    while (String(d) === digits[i]);
    digits[i] = String(d);
    return Number(digits.join(''));
}
/**
 * Breaks a clean statement the way a careless extraction would. The statement's printed balances are
 * left as the bank wrote them; only the extracted rows change. Returns null when the fault cannot be
 * applied to this statement (for example no amount has two different adjacent digits).
 */
export function injectFault(clean, kind, rng) {
    const rows = clean.rows.map((r) => ({ ...r }));
    const n = rows.length;
    if (n < 4)
        return null;
    const at = int(rng, 0, n - 1);
    const target = rows[at];
    const done = (next, truth) => ({ statement: { ...clean, rows: next }, truth });
    switch (kind) {
        case 'missing_row': {
            const next = renumber(rows.filter((_, i) => i !== at));
            const follower = next[at];
            return done(next, { kind, lines: follower ? [follower.line] : [], missing: target });
        }
        case 'duplicate_row': {
            const next = renumber([...rows.slice(0, at + 1), { ...target }, ...rows.slice(at + 1)]);
            return done(next, { kind, lines: [next[at + 1].line] });
        }
        case 'sign_flip': {
            target.direction = target.direction === 'credit' ? 'debit' : 'credit';
            return done(rows, { kind, lines: [target.line] });
        }
        case 'transposition': {
            const wrong = transposed(target.amountMinor, rng);
            if (wrong === null)
                return null;
            const truth = { kind, lines: [target.line], correctAmounts: { [target.line]: target.amountMinor } };
            target.amountMinor = wrong;
            return done(rows, truth);
        }
        case 'decimal_shift': {
            const right = target.amountMinor;
            const wrong = right % 10 === 0 && rng() < 0.5 ? right / 10 : right * 10;
            target.amountMinor = wrong;
            return done(rows, { kind, lines: [target.line], correctAmounts: { [target.line]: right } });
        }
        case 'digit_substitution': {
            const right = target.amountMinor;
            target.amountMinor = substituted(right, rng);
            return done(rows, { kind, lines: [target.line], correctAmounts: { [target.line]: right } });
        }
        case 'compensating': {
            // Two amounts are wrong by the same sum in opposite directions, so the totals still agree.
            const others = rows.filter((r, i) => i !== at && r.direction === target.direction);
            if (!others.length)
                return null;
            const other = pick(rng, others);
            const shift = int(rng, 1, Math.max(1, Math.min(target.amountMinor, other.amountMinor) - 1));
            if (shift >= other.amountMinor)
                return null;
            const truth = {
                kind,
                lines: [target.line, other.line].sort((a, b) => a - b),
                correctAmounts: { [target.line]: target.amountMinor, [other.line]: other.amountMinor },
            };
            target.amountMinor += shift;
            other.amountMinor -= shift;
            return done(rows, truth);
        }
    }
}
/** The same statement as an extraction without the balance column. */
export function withoutBalances(statement) {
    return {
        ...statement,
        rows: statement.rows.map((r) => {
            const { balanceAfterMinor: _dropped, ...rest } = r;
            return rest;
        }),
    };
}
/** Renders a statement as CSV in the Date, Description, Debit, Credit, Balance, Reference layout. */
export function toCsv(statement, format) {
    const quote = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
    const lines = ['Date,Description,Debit,Credit,Balance,Reference'];
    for (const r of statement.rows) {
        lines.push([
            r.date,
            quote(r.description),
            r.direction === 'debit' ? quote(format(r.amountMinor)) : '',
            r.direction === 'credit' ? quote(format(r.amountMinor)) : '',
            r.balanceAfterMinor === undefined ? '' : quote(format(r.balanceAfterMinor)),
            r.reference ?? '',
        ].join(','));
    }
    return lines.join('\n') + '\n';
}
