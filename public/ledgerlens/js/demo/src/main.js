import { mountLedger } from './ledger.js';
import { mountQuickAdd } from './quickadd.js';
const bench = document.getElementById('bench');
const quickadd = document.getElementById('quickadd');
if (bench)
    mountLedger(bench);
if (quickadd) {
    const start = () => mountQuickAdd(quickadd, new URL('./quickadd-tagger.json', document.baseURI).href);
    // Load the model after first paint so the ledger is usable at once.
    if ('requestIdleCallback' in window)
        window.requestIdleCallback(start);
    else
        setTimeout(start, 200);
}
