/**
 * A number whose digits roll. Columns are matched from the right, so "4,500.00" -> "0.00" rolls the
 * cents and units in place and removes the extra leading columns. Only digits that change move.
 */
export class RollingNumber {
    el;
    current = '';
    constructor(el) {
        this.el = el;
        this.el.classList.add('roll');
    }
    set(text, accessibleText) {
        this.el.setAttribute('aria-label', accessibleText);
        if (text === this.current)
            return;
        const prev = this.current;
        this.current = text;
        const sameShape = prev.length === text.length && [...prev].every((c, i) => /\d/.test(c) === /\d/.test(text[i] ?? ''));
        if (!sameShape) {
            // Rebuild, keeping existing columns where the right-aligned positions line up, so they can still roll.
            const oldCols = [...this.el.children];
            const frag = document.createDocumentFragment();
            for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                const fromRight = text.length - 1 - i;
                const reuse = oldCols[oldCols.length - 1 - fromRight];
                if (/\d/.test(ch) && reuse && reuse.classList.contains('col')) {
                    frag.append(reuse);
                }
                else if (/\d/.test(ch)) {
                    frag.append(this.column(ch, true));
                }
                else {
                    const s = document.createElement('span');
                    s.className = 'static';
                    s.textContent = ch;
                    s.setAttribute('aria-hidden', 'true');
                    frag.append(s);
                }
            }
            this.el.replaceChildren(frag);
        }
        // Move each strip to its digit (on the next frame, so newly built columns start from 0).
        const cols = [...this.el.children];
        requestAnimationFrame(() => {
            cols.forEach((col, i) => {
                const ch = text[i];
                if (!col.classList.contains('col'))
                    return;
                const strip = col.firstElementChild;
                strip.style.transform = `translateY(${-Number(ch) * 1.1}em)`;
            });
        });
    }
    column(ch, fromZero) {
        const col = document.createElement('span');
        col.className = 'col';
        col.setAttribute('aria-hidden', 'true');
        const strip = document.createElement('span');
        strip.className = 'strip';
        for (let d = 0; d <= 9; d++) {
            const s = document.createElement('span');
            s.textContent = String(d);
            strip.append(s);
        }
        strip.style.transform = `translateY(${-(fromZero ? 0 : Number(ch)) * 1.1}em)`;
        col.append(strip);
        return col;
    }
}
