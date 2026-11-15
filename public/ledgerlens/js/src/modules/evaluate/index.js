/**
 * Scores the reconciler against invented statements with one known injected fault.
 * Used by the test suite and by `npm run eval`, so the published numbers and the tests agree.
 */
import { reconcile } from '../reconcile/index.js';
import { signed } from '../statement/index.js';
import { FAULT_KINDS, generateStatement, injectFault, seededRng, withoutBalances } from '../synth/index.js';
function proposalMatches(p, truth, line) {
    switch (truth.kind) {
        case 'missing_row': {
            const m = truth.missing;
            if (!m || p.kind !== 'missing_row' || p.fix.type !== 'insert_row')
                return false;
            const fixSigned = p.fix.row.direction === 'credit' ? p.fix.row.amountMinor : -p.fix.row.amountMinor;
            return fixSigned === signed(m);
        }
        case 'duplicate_row':
            return p.kind === 'duplicate_row' && p.fix.type === 'remove_row';
        case 'sign_flip':
            return p.kind === 'sign_flip' && p.fix.type === 'flip_direction' && p.fix.line === line;
        case 'transposition':
        case 'decimal_shift':
        case 'digit_substitution':
        case 'compensating':
            return (p.kind === 'amount_error' && p.fix.type === 'set_amount' && line !== undefined && p.fix.line === line && p.fix.amountMinor === truth.correctAmounts?.[line]);
    }
}
function scoreRunning(report, truth) {
    // A missing row at the very end is reported against the last line with beforeLine = null.
    const atEnd = truth.kind === 'missing_row' && truth.lines.length === 0;
    const located = (f, line) => {
        if (atEnd)
            return f.fix.type === 'insert_row' && f.fix.beforeLine === null;
        if (truth.kind === 'duplicate_row')
            return f.lines.includes(line);
        return f.lines[0] === line;
    };
    const targets = atEnd ? [undefined] : truth.lines;
    const hits = targets.map((line) => ({ line, finding: report.findings.find((f) => located(f, line)) }));
    const detected = hits.every((h) => h.finding) && (truth.kind !== 'compensating' || report.compensating);
    const top1 = detected && hits.every((h) => proposalMatches(h.finding, truth, h.line));
    const listed = detected && hits.every((h) => [h.finding, ...h.finding.alternatives].some((p) => proposalMatches(p, truth, h.line)));
    return { detected, top1, listed, noExtras: report.findings.length === targets.length };
}
function scoreTotals(report, truth) {
    const line = truth.lines[0];
    const matches = (f) => {
        if (truth.kind === 'duplicate_row')
            return f.kind === 'duplicate_row' && f.lines.includes(line);
        if (truth.kind === 'missing_row')
            return proposalMatches(f, truth, line);
        return proposalMatches(f, truth, line);
    };
    const rank = report.findings.findIndex(matches);
    return {
        detected: report.status === 'needs_review',
        top1: rank === 0,
        listed: rank >= 0 && rank < 3,
        noExtras: report.findings.length <= 1,
    };
}
/** Runs `casesPerFault` seeded statements per fault type in one mode. Deterministic for a given seed. */
export function runEval(mode, casesPerFault, seed = 20261111) {
    const rows = [];
    const prepare = mode === 'totals_only' ? withoutBalances : (s) => s;
    const clean = { fault: 'clean', cases: casesPerFault, detected: 0, top1: 0, listed: 0, noExtras: 0 };
    for (let i = 0; i < casesPerFault; i++) {
        const report = reconcile(prepare(generateStatement(seed + i)));
        // For clean statements "detected" counts false alarms; the other columns count correct passes.
        if (report.findings.length)
            clean.detected++;
        else {
            clean.top1++;
            clean.listed++;
            clean.noExtras++;
        }
    }
    rows.push(clean);
    FAULT_KINDS.forEach((fault, k) => {
        const row = { fault, cases: 0, detected: 0, top1: 0, listed: 0, noExtras: 0 };
        const rng = seededRng(seed * 31 + k);
        for (let i = 0; row.cases < casesPerFault && i < casesPerFault * 5; i++) {
            const faulty = injectFault(generateStatement(seed + 100_000 * (k + 1) + i), fault, rng);
            if (!faulty)
                continue;
            row.cases++;
            const report = reconcile(prepare(faulty.statement));
            const score = mode === 'running_balance' ? scoreRunning(report, faulty.truth) : scoreTotals(report, faulty.truth);
            if (score.detected)
                row.detected++;
            if (score.top1)
                row.top1++;
            if (score.listed)
                row.listed++;
            if (score.noExtras)
                row.noExtras++;
        }
        rows.push(row);
    });
    return { mode, rows };
}
export { scoreRunning, scoreTotals };
