/**
 * The workbench: an invented statement, buttons that break it the way careless imports do, and the
 * reconciler's verdict with fixes a person approves. Every number comes from the real LedgerLens core.
 */
import { formatAmount } from '../../src/modules/money/index.js';
import { applyFix, reconcile } from '../../src/modules/reconcile/index.js';
import { generateStatement, injectFault, seededRng, withoutBalances } from '../../src/modules/synth/index.js';
import { RollingNumber } from './roll.js';
const BREAKS = [
    { kind: 'missing_row', label: 'Drop a row', says: 'A row was dropped.' },
    { kind: 'duplicate_row', label: 'Repeat a row', says: 'A row was repeated.' },
    { kind: 'sign_flip', label: 'Flip debit and credit', says: 'A debit and credit were flipped.' },
    { kind: 'transposition', label: 'Swap two digits', says: 'Two digits were swapped.' },
    { kind: 'decimal_shift', label: 'Shift the decimal', says: 'A decimal point was shifted.' },
    { kind: 'compensating', label: 'Two errors that cancel', says: 'Two amounts were changed so the totals still match.' },
];
const peso = (minor) => '₱' + formatAmount(Math.abs(minor));
export function mountLedger(root) {
    const $ = (sel) => root.querySelector(sel);
    const tbody = $('#ledger-rows');
    const meta = $('#ledger-meta');
    const controls = $('#breaks');
    const hideToggle = $('#hide-balance');
    const freshBtn = $('#fresh');
    const undoBtn = $('#undo');
    const findingsEl = $('#findings');
    const status = $('#status');
    const note = $('#verdict-note');
    const deltaWrap = $('#delta');
    const live = $('#live');
    const delta = new RollingNumber($('#delta-value'));
    const rowEls = new Map();
    const state = {
        seed: 7,
        statement: generateStatement(7, { rows: 14, withReference: false }),
        history: [],
        hideBalance: false,
        skipped: new Set(),
        added: new Set(),
        seenFlags: new Set(),
    };
    let rng = seededRng(2026);
    for (const b of BREAKS) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn';
        btn.textContent = b.label;
        btn.addEventListener('click', () => breakIt(b.kind, b.says));
        controls.append(btn);
    }
    hideToggle.addEventListener('change', () => {
        state.hideBalance = hideToggle.checked;
        render();
        announce(state.hideBalance ? 'Balance column hidden. Only the totals can be checked now.' : 'Balance column shown. Every row is checked.');
    });
    freshBtn.addEventListener('click', () => {
        state.seed += 1;
        state.statement = generateStatement(state.seed, { rows: 14, withReference: false });
        state.history = [];
        state.skipped.clear();
        state.added.clear();
        state.seenFlags.clear();
        rowEls.forEach((tr) => tr.remove());
        rowEls.clear();
        render();
        announce('New statement loaded. It balances.');
    });
    undoBtn.addEventListener('click', () => {
        const prev = state.history.pop();
        if (!prev)
            return;
        state.statement = prev;
        state.skipped.clear();
        render();
        announce('Last change undone.');
    });
    function announce(text) {
        live.textContent = '';
        requestAnimationFrame(() => (live.textContent = text));
    }
    function breakIt(kind, says) {
        for (let attempt = 0; attempt < 8; attempt++) {
            const broken = injectFault(state.statement, kind, rng);
            if (!broken)
                continue;
            state.history.push(state.statement);
            // Renumbered rows keep their identity by content, so re-key the "added by you" marks.
            state.statement = broken.statement;
            state.skipped.clear();
            render();
            const report = currentReport();
            announce(`${says} ${report.status === 'balanced' ? 'The totals still agree, so a totals check cannot see it.' : `The check found ${report.findings.length} thing${report.findings.length === 1 ? '' : 's'} to look at.`}`);
            return;
        }
        announce('That change does not fit this statement. Try another, or load a new statement.');
    }
    function approve(fix) {
        const result = applyFix(state.statement, fix, { approvedBy: 'you', at: new Date().toISOString() });
        state.history.push(state.statement);
        state.statement = result.statement;
        if (fix.type === 'insert_row' && result.audit.after)
            state.added.add(result.audit.after.line);
        state.skipped.clear();
        render();
        const report = currentReport();
        announce(report.status === 'balanced' ? 'Fix approved. The statement balances.' : `Fix approved. ${report.findings.length} left to look at.`);
    }
    function viewStatement() {
        return state.hideBalance ? withoutBalances(state.statement) : state.statement;
    }
    function currentReport() {
        return reconcile(viewStatement());
    }
    function render() {
        const report = currentReport();
        renderRows(report);
        renderVerdict(report);
        renderFindings(report);
        undoBtn.disabled = state.history.length === 0;
    }
    function renderRows(report) {
        const s = state.statement;
        const flagged = new Set();
        const gapAbove = new Set();
        let gapAtEnd = false;
        // In totals-only mode the findings are alternatives for one delta; highlight only the first.
        const shown = report.mode === 'totals_only' ? report.findings.slice(0, 1) : report.findings;
        shown.forEach((f, i) => {
            if (state.skipped.has(key(f, i)))
                return;
            if (f.fix.type === 'insert_row') {
                if (f.fix.beforeLine === null)
                    gapAtEnd = true;
                else
                    gapAbove.add(f.fix.beforeLine);
            }
            else
                f.lines.forEach((l) => flagged.add(l));
        });
        meta.innerHTML = '';
        const open = document.createElement('span');
        open.innerHTML = `Opening balance <b class="num">${peso(s.openingMinor ?? 0)}</b>`;
        const close = document.createElement('span');
        close.innerHTML = `Closing balance <b class="num">${peso(s.closingMinor ?? 0)}</b>`;
        meta.append(open, close);
        const seen = new Set();
        s.rows.forEach((row, index) => {
            seen.add(row.line);
            let tr = rowEls.get(row.line);
            if (!tr) {
                tr = document.createElement('tr');
                rowEls.set(row.line, tr);
            }
            fillRow(tr, row);
            const isFlag = flagged.has(row.line);
            const flagKey = `${row.line}:${row.amountMinor}:${row.direction}`;
            tr.classList.toggle('flag', isFlag);
            tr.classList.toggle('fresh', isFlag && !state.seenFlags.has(flagKey));
            if (isFlag)
                state.seenFlags.add(flagKey);
            tr.classList.toggle('gap-above', gapAbove.has(row.line));
            tr.classList.toggle('gap-below', gapAtEnd && index === s.rows.length - 1);
            tr.classList.toggle('added', state.added.has(row.line));
            tr.classList.toggle('hidden-bal', state.hideBalance);
            tbody.append(tr); // re-appending keeps the element (and its transitions) while fixing the order
        });
        for (const [line, tr] of rowEls) {
            if (!seen.has(line)) {
                tr.remove();
                rowEls.delete(line);
            }
        }
    }
    function fillRow(tr, row) {
        const debit = row.direction === 'debit';
        const amount = (debit ? '−' : '+') + formatAmount(row.amountMinor);
        const bal = row.balanceAfterMinor === undefined ? '' : formatAmount(row.balanceAfterMinor);
        const html = `<td class="line num"><span>${state.added.has(row.line) ? 'new' : row.line}</span></td>` +
            `<td class="date num"><span>${row.date.slice(5)}</span></td>` +
            `<td class="desc"><span>${escapeHtml(row.description)}</span><span class="sub num">${row.date}</span></td>` +
            `<td class="amt ${debit ? 'debit' : 'credit'}"><span>${amount}</span><span class="visually-hidden">${debit ? 'debit' : 'credit'}</span></td>` +
            `<td class="amt bal"><span>${state.hideBalance ? '—' : bal}</span></td>`;
        if (tr.innerHTML !== html)
            tr.innerHTML = html;
    }
    function renderVerdict(report) {
        const d = report.totals.deltaMinor ?? 0;
        const open = report.findings.filter((f, i) => !state.skipped.has(key(f, i)));
        let mode;
        let label;
        if (report.status === 'balanced') {
            mode = 'ok';
            label = report.mode === 'running_balance' ? 'Balanced. Every row matches the running balance.' : 'The totals agree.';
        }
        else if (d === 0) {
            mode = 'off';
            label = 'The totals agree, but some rows do not.';
        }
        else {
            mode = 'off';
            label = 'This statement does not add up.';
        }
        if (report.status !== 'balanced' && open.length === 0) {
            mode = 'quiet';
            label = 'Everything left was skipped. The import would go in as it is.';
        }
        for (const span of status.children)
            span.setAttribute('aria-hidden', String(span.getAttribute('data-mode') !== mode));
        const visible = status.querySelector(`[data-mode="${mode}"]`);
        visible.textContent = label;
        deltaWrap.classList.toggle('is-off', d !== 0);
        deltaWrap.classList.toggle('is-ok', d === 0);
        const prefix = d === 0 ? 'Difference' : d > 0 ? 'Short by' : 'Over by';
        deltaWrap.querySelector('.prefix').textContent = prefix;
        delta.set(peso(d), `${prefix} ${peso(d)}`);
        const notes = [...report.notes];
        if (report.mode === 'totals_only' && report.status === 'balanced')
            notes.unshift('Hidden errors that cancel out would not show here. Turn the balance column back on to check every row.');
        note.textContent = notes[0] ?? 'Statement balance minus the rows you imported.';
    }
    function renderFindings(report) {
        findingsEl.innerHTML = '';
        if (!report.findings.length) {
            const p = document.createElement('p');
            p.className = 'empty';
            p.textContent = 'Nothing to fix. Use the buttons above to break the statement the way a careless import would.';
            findingsEl.append(p);
            return;
        }
        const totalsOnly = report.mode === 'totals_only';
        const list = totalsOnly ? report.findings.slice(0, 3) : report.findings;
        list.forEach((f, i) => {
            const li = document.createElement('li');
            li.className = 'finding';
            const k = key(f, i);
            if (state.skipped.has(k))
                li.classList.add('skipped');
            const h = document.createElement('h3');
            h.textContent = totalsOnly ? (i === 0 ? 'Most likely' : `Or: ${title(f)}`) : title(f);
            const p = document.createElement('p');
            p.textContent = f.message;
            li.append(h, p);
            const actions = document.createElement('div');
            actions.className = 'actions';
            const approveBtn = button(fixLabel(f.fix), i === 0 ? 'btn btn-primary' : 'btn', () => approve(f.fix));
            actions.append(approveBtn);
            if (!totalsOnly && f.alternatives[0]) {
                const alt = f.alternatives[0];
                actions.append(button(fixLabel(alt.fix), 'btn', () => approve(alt.fix)));
            }
            if (!totalsOnly)
                actions.append(button(state.skipped.has(k) ? 'Skipped' : 'Skip', 'btn btn-quiet', () => {
                    state.skipped.add(k);
                    render();
                    announce('Skipped. That row would be imported as it is.');
                }));
            li.append(actions);
            if (!totalsOnly && f.alternatives[0]) {
                const alt = document.createElement('p');
                alt.className = 'alt';
                alt.textContent = `The numbers fit two explanations: ${f.alternatives[0].message} Arithmetic alone cannot choose, so you do.`;
                li.append(alt);
            }
            findingsEl.append(li);
        });
        if (totalsOnly && report.findings.length > 1) {
            const p = document.createElement('p');
            p.className = 'empty';
            p.textContent = 'Without a balance column only one total can be checked, so these are alternatives for the same gap: at most one is true.';
            findingsEl.append(p);
        }
    }
    render();
}
function key(f, i) {
    return `${i}:${f.kind}:${f.lines.join(',')}:${f.deltaMinor}`;
}
function title(f) {
    switch (f.kind) {
        case 'missing_row': return 'A transaction is missing';
        case 'duplicate_row': return 'A row appears twice';
        case 'sign_flip': return 'Money went the other way';
        case 'amount_error': return f.shape === 'transposition' ? 'Two digits look swapped' : f.shape === 'decimal_shift' ? 'The decimal point looks shifted' : 'An amount does not fit';
    }
}
function fixLabel(fix) {
    switch (fix.type) {
        case 'remove_row': return `Remove line ${fix.line}`;
        case 'flip_direction': return `Flip line ${fix.line}`;
        case 'set_amount': return `Change to ₱${formatAmount(fix.amountMinor)}`;
        case 'insert_row': return `Add the missing ₱${formatAmount(fix.row.amountMinor)}`;
    }
}
function button(label, className, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
}
function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
