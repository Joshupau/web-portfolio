const AMOUNT_LIKE = /^(?:₱|php|p)?\d[\d,]*(?:\.\d+)?k?$/i;
export function tokenize(message) {
    const out = [];
    const re = /₱?\d[\d,]*(?:\.\d+)?(?:k(?![a-z]))?|[a-zÀ-ɏ]+(?:'[a-z]+)?|[^\s\w]/giu;
    let m;
    while ((m = re.exec(message))) {
        const text = m[0];
        // "7-11" / "7-eleven": glue a lone digit-dash-word back together as one token.
        const prev = out[out.length - 1];
        if (text === '-' && prev && /^\d+$/.test(prev.text) && message[m.index + 1] && /[\da-z]/i.test(message[m.index + 1])) {
            const rest = /^[\da-z]+/i.exec(message.slice(m.index + 1));
            if (rest) {
                prev.text += '-' + rest[0];
                prev.end = m.index + 1 + rest[0].length;
                re.lastIndex = prev.end;
                continue;
            }
        }
        out.push({ text, start: m.index, end: m.index + text.length });
    }
    return out;
}
export const looksLikeAmount = (text) => AMOUNT_LIKE.test(text);
