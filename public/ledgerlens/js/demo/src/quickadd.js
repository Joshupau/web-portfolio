/**
 * Quick-add: type a money message the way people do, and see what the on-device tagger reads.
 * The model loads once, after the page has painted. Typing updates instantly, with no animation.
 */
import { CATEGORIES, decode, Tagger, WALLETS } from '../../src/modules/quickadd/index.js';
const LABELS = {
    AMOUNT: 'amount',
    WALLET: 'from',
    WALLET_TO: 'to',
    CAT: 'what',
    DATE: 'when',
    QTY: 'times',
    FEE: 'fee',
    NOTE: 'note',
    O: '',
};
export function mountQuickAdd(root, modelUrl) {
    const $ = (sel) => root.querySelector(sel);
    const input = $('#qa-text');
    const tokensEl = $('#qa-tokens');
    const fieldsEl = $('#qa-fields');
    const evidenceEl = $('#qa-evidence');
    const stateEl = $('#qa-state');
    const examples = $('#qa-examples');
    let tagger = null;
    const ctx = {
        wallets: WALLETS.map((w) => ({ name: w.name, type: w.type })),
        categories: CATEGORIES.map((name) => ({ name })),
        now: new Date(),
    };
    for (const text of ['grab 305 gcas', 'lunch150', 'pasa 2k bdo to gotyme', 'sahod ko 32,000 bdo', 'meds 2x 120', 'kahapon groceries 1,850 maya']) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn';
        b.textContent = text;
        b.addEventListener('click', () => {
            input.value = text;
            run();
            input.focus();
        });
        examples.append(b);
    }
    input.addEventListener('input', run);
    const t0 = performance.now();
    stateEl.textContent = 'Loading the model (about 190 KB compressed)…';
    fetch(modelUrl)
        .then((r) => {
        if (!r.ok)
            throw new Error(`HTTP ${r.status}`);
        return r.json();
    })
        .then((model) => {
        tagger = Tagger.fromJSON(model);
        stateEl.textContent = `Model loaded in ${Math.round(performance.now() - t0)} ms on this device. It runs here, in your browser.`;
        run();
    })
        .catch((err) => {
        stateEl.classList.add('error');
        stateEl.textContent = `The model did not load (${err.message}). Reload the page to try again; in Fico the rules parser would answer on its own.`;
    });
    function run() {
        if (!tagger)
            return;
        const text = input.value;
        const tagged = tagger.tag(text);
        const result = decode(tagged, ctx);
        tokensEl.replaceChildren(...tagged.tokens.map((t, i) => {
            const tag = tagged.tags[i] ?? 'O';
            const entity = tag === 'O' ? 'O' : tag.slice(2);
            const span = document.createElement('span');
            span.className = 'tok';
            span.dataset.e = entity;
            const tt = document.createElement('span');
            tt.className = 't';
            tt.textContent = t.text;
            const k = document.createElement('span');
            k.className = 'k';
            k.textContent = LABELS[entity] ?? '';
            span.append(tt, k);
            return span;
        }));
        if (!tagged.tokens.length) {
            const p = document.createElement('span');
            p.className = 'qa-state';
            p.textContent = 'Type a message above, for example "coffee 150 gcash".';
            tokensEl.append(p);
        }
        const rows = [
            ['Amount', result.amount === undefined ? 'not found' : '₱' + result.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
            ['Type', result.type ?? 'not sure'],
            ['From', result.fromWalletName ?? 'not given'],
            ['To', result.toWalletName ?? (result.type === 'transfer' ? 'not given' : 'not a transfer')],
            ['Category', result.inferredCategoryName ?? 'not sure'],
            ['Date', result.date ?? 'today'],
        ];
        if (result.serviceFee !== undefined)
            rows.push(['Fee', '₱' + result.serviceFee.toFixed(2)]);
        fieldsEl.replaceChildren(...rows.flatMap(([k, v]) => {
            const dt = document.createElement('dt');
            dt.textContent = k;
            const dd = document.createElement('dd');
            dd.textContent = v;
            return [dt, dd];
        }));
        evidenceEl.replaceChildren(...result.evidence.map((e) => {
            const li = document.createElement('li');
            li.textContent = e;
            return li;
        }));
    }
}
