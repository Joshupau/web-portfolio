/**
 * Adapter to Fico's CSV import shape (fico: utils/import-csv.ts, `ImportRow`).
 * Fico stores amounts as decimal numbers, so minor units are converted here, at the edge, from an
 * exact decimal string. LedgerLens never does arithmetic on the converted value.
 */
import { toDecimalString } from '../money/index.js';
export function toFicoImportRows(statement) {
    return statement.rows.map((row) => ({
        date: new Date(`${row.date}T00:00:00.000Z`).toISOString(),
        amount: Number(toDecimalString(row.amountMinor, statement.currency)),
        type: row.direction === 'credit' ? 'income' : 'expense',
        description: row.description || row.reference || '(no description)',
        tags: [],
        category_id: null,
    }));
}
