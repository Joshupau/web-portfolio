import { parseAmount } from '../money/index.js';
const normalizeKey = (key) => key.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
/** Header aliases follow Fico's importer (utils/import-csv.ts) so the same files work in both. */
const ALIASES = {
    date: ['date', 'date_and_time', 'datetime', 'book_date', 'booking_date', 'value_date', 'transaction_date', 'posting_date'],
    description: ['description', 'memo', 'narration', 'details', 'particulars', 'counter_party_name', 'payee', 'merchant'],
    debit: ['debit', 'withdrawal', 'withdrawals', 'money_out', 'debit_amount'],
    credit: ['credit', 'deposit', 'deposits', 'money_in', 'credit_amount'],
    amount: ['amount', 'transaction_amount'],
    indicator: ['credit_debit_indicator', 'indicator', 'type', 'dr_cr', 'transaction_type'],
    balance: ['balance', 'running_balance', 'balance_after', 'available_balance', 'ending_balance'],
    reference: ['reference', 'ref', 'reference_no', 'reference_number', 'transaction_reference', 'transaction_id'],
};
function splitCsv(content) {
    const text = content.replace(/^﻿/, '');
    const physical = text.split(/\r?\n/);
    const firstIndex = physical.findIndex((l) => l.trim());
    if (firstIndex < 0)
        return { header: [], lines: [] };
    const headerRaw = physical[firstIndex] ?? '';
    const sep = headerRaw.includes('\t') ? '\t' : headerRaw.includes(';') && !headerRaw.includes(',') ? ';' : ',';
    const parseLine = (line) => {
        const cells = [];
        let cur = '';
        let quoted = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') {
                if (quoted && line[i + 1] === '"') {
                    cur += '"';
                    i++;
                }
                else
                    quoted = !quoted;
            }
            else if (c === sep && !quoted) {
                cells.push(cur.trim());
                cur = '';
            }
            else
                cur += c;
        }
        cells.push(cur.trim());
        return cells;
    };
    const lines = [];
    for (let i = firstIndex + 1; i < physical.length; i++) {
        const raw = physical[i] ?? '';
        if (raw.trim())
            lines.push({ line: i + 1, raw, cells: parseLine(raw) });
    }
    return { header: parseLine(headerRaw).map(normalizeKey), lines };
}
/** Accepts YYYY-MM-DD, YYYY/MM/DD, YYYYMMDD, DD/MM/YYYY and DD-MM-YYYY, each with an optional time. */
export function parseStatementDate(text) {
    const t = text.trim();
    let y, m, d;
    let match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T].*)?$/.exec(t);
    if (match)
        [, y, m, d] = match;
    else if ((match = /^(\d{4})(\d{2})(\d{2})$/.exec(t)))
        [, y, m, d] = match;
    else if ((match = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[ T].*)?$/.exec(t)))
        [, d, m, y] = match;
    else
        return null;
    const year = Number(y), month = Number(m), day = Number(d);
    if (month < 1 || month > 12 || day < 1 || day > 31)
        return null;
    const check = new Date(Date.UTC(year, month - 1, day));
    if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day)
        return null;
    return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function directionFrom(indicator) {
    const u = indicator.trim().toUpperCase();
    if (['CRDT', 'CREDIT', 'C', 'CR', 'IN', 'DEPOSIT', 'INCOME'].includes(u))
        return 'credit';
    if (['DBIT', 'DEBIT', 'D', 'DR', 'OUT', 'WITHDRAWAL', 'EXPENSE'].includes(u))
        return 'debit';
    return null;
}
/**
 * Parses a statement CSV. Supported layouts: separate Debit/Credit columns; one signed Amount column;
 * or an unsigned Amount with a credit/debit indicator. A Balance column is optional but makes the
 * reconciler far more precise. Rows that cannot be read are returned in `rejected`, never dropped quietly.
 */
export function parseStatementCsv(content, options = {}) {
    const maxBytes = options.maxBytes ?? 5_000_000;
    const maxRows = options.maxRows ?? 50_000;
    if (content.length > maxBytes)
        return { ok: false, reason: 'too_large' };
    const currency = options.currency ?? 'PHP';
    const { header, lines } = splitCsv(content);
    if (!header.length || !lines.length)
        return { ok: false, reason: 'empty' };
    if (lines.length > maxRows)
        return { ok: false, reason: 'too_many_rows' };
    const column = (names) => header.findIndex((h) => names.includes(h));
    const col = {
        date: column(ALIASES.date),
        description: column(ALIASES.description),
        debit: column(ALIASES.debit),
        credit: column(ALIASES.credit),
        amount: column(ALIASES.amount),
        indicator: column(ALIASES.indicator),
        balance: column(ALIASES.balance),
        reference: column(ALIASES.reference),
    };
    if (col.date < 0)
        return { ok: false, reason: 'no_date_column' };
    if (col.debit < 0 && col.credit < 0 && col.amount < 0)
        return { ok: false, reason: 'no_amount_column' };
    const rows = [];
    const rejected = [];
    for (const { line, raw, cells } of lines) {
        const cell = (i) => (i >= 0 ? (cells[i] ?? '') : '');
        const date = parseStatementDate(cell(col.date));
        if (!date) {
            rejected.push({ line, reason: 'missing_date', raw });
            continue;
        }
        let direction = null;
        let amountMinor = null;
        if (col.debit >= 0 || col.credit >= 0) {
            const debit = parseAmount(cell(col.debit), currency);
            const credit = parseAmount(cell(col.credit), currency);
            // Exports often put 0.00 in the unused column, so the non-zero one wins.
            if (debit.ok && debit.minor !== 0) {
                direction = debit.minor < 0 ? 'credit' : 'debit';
                amountMinor = Math.abs(debit.minor);
            }
            else if (credit.ok && credit.minor !== 0) {
                direction = credit.minor < 0 ? 'debit' : 'credit';
                amountMinor = Math.abs(credit.minor);
            }
        }
        if (amountMinor === null && col.amount >= 0) {
            const amount = parseAmount(cell(col.amount), currency);
            if (amount.ok && amount.minor !== 0) {
                const fromIndicator = directionFrom(cell(col.indicator));
                direction = fromIndicator ?? (amount.minor < 0 ? 'debit' : col.indicator >= 0 ? null : 'credit');
                amountMinor = Math.abs(amount.minor);
                if (!direction) {
                    rejected.push({ line, reason: 'missing_direction', raw });
                    continue;
                }
            }
        }
        if (amountMinor === null || !direction) {
            rejected.push({ line, reason: 'invalid_amount', raw });
            continue;
        }
        const row = { line, date, description: cell(col.description), direction, amountMinor };
        const balanceText = cell(col.balance);
        if (balanceText) {
            const balance = parseAmount(balanceText, currency);
            if (!balance.ok) {
                rejected.push({ line, reason: 'invalid_balance', raw });
                continue;
            }
            row.balanceAfterMinor = balance.minor;
        }
        const reference = cell(col.reference);
        if (reference)
            row.reference = reference;
        rows.push(row);
    }
    const statement = { account: options.account ?? 'Statement', currency, rows };
    if (options.openingMinor !== undefined)
        statement.openingMinor = options.openingMinor;
    if (options.closingMinor !== undefined)
        statement.closingMinor = options.closingMinor;
    return { ok: true, statement, rejected };
}
