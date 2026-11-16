/** +amount for a credit, -amount for a debit. */
export const signed = (row) => row.direction === 'credit' ? row.amountMinor : -row.amountMinor;
