/**
 * Applies one approved fix and returns a new statement plus an audit entry.
 * The input statement is not modified.
 */
export function applyFix(statement, fix, approval) {
    if (!approval.approvedBy.trim())
        throw new Error('a fix needs a named approver');
    const rows = statement.rows.map((r) => ({ ...r }));
    const indexOf = (line) => {
        const i = rows.findIndex((r) => r.line === line);
        if (i < 0)
            throw new Error(`no row at line ${line}`);
        return i;
    };
    let before = null;
    let after = null;
    switch (fix.type) {
        case 'remove_row': {
            const i = indexOf(fix.line);
            before = statement.rows[i] ?? null;
            rows.splice(i, 1);
            break;
        }
        case 'flip_direction': {
            const i = indexOf(fix.line);
            const row = rows[i];
            before = statement.rows[i] ?? null;
            row.direction = row.direction === 'credit' ? 'debit' : 'credit';
            after = { ...row };
            break;
        }
        case 'set_amount': {
            if (!Number.isSafeInteger(fix.amountMinor) || fix.amountMinor < 0)
                throw new RangeError('amount must be a non-negative integer of minor units');
            const i = indexOf(fix.line);
            const row = rows[i];
            before = statement.rows[i] ?? null;
            row.amountMinor = fix.amountMinor;
            after = { ...row };
            break;
        }
        case 'insert_row': {
            if (!Number.isSafeInteger(fix.row.amountMinor) || fix.row.amountMinor < 0)
                throw new RangeError('amount must be a non-negative integer of minor units');
            const line = rows.reduce((max, r) => Math.max(max, r.line), 1) + 1;
            const row = { line, ...fix.row };
            const at = fix.beforeLine === null ? rows.length : indexOf(fix.beforeLine);
            rows.splice(at, 0, row);
            after = { ...row };
            break;
        }
    }
    return {
        statement: { ...statement, rows },
        audit: { fix, approvedBy: approval.approvedBy, at: approval.at, before, after },
    };
}
