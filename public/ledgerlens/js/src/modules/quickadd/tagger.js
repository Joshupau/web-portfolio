/**
 * A small quick-add tagger: labels each token (amount, wallet, category cue, quantity, date, fee)
 * and classifies the message type. Trained with an averaged perceptron; the whole model is JSON.
 */
import { messageFeatures, tokenFeatures } from './features.js';
import { AveragedPerceptron } from './perceptron.js';
import { tokenize } from './tokenize.js';
export const ENTITY_TYPES = ['AMOUNT', 'WALLET', 'WALLET_TO', 'CAT', 'DATE', 'QTY', 'FEE', 'NOTE'];
export const TAGS = ['O', ...ENTITY_TYPES.flatMap((e) => [`B-${e}`, `I-${e}`])];
export const MESSAGE_TYPES = ['expense', 'income', 'transfer'];
const categoryFeatures = (span, type) => {
    const words = span.toLowerCase().split(/\s+/);
    const f = ['b', 'type=' + type];
    for (const w of words) {
        f.push('w=' + w, 'p4=' + w.slice(0, 4), 's3=' + w.slice(-3));
        const padded = `#${w}#`;
        for (let k = 0; k + 3 <= padded.length; k++)
            f.push('c3=' + padded.slice(k, k + 3));
    }
    return f;
};
const margin = (scores, winner) => {
    const w = scores.get(winner) ?? 0;
    let second = -Infinity;
    for (const [l, s] of scores)
        if (l !== winner && s > second)
            second = s;
    return second === -Infinity ? w : w - second;
};
export function spansFrom(tokens, tags) {
    const spans = [];
    let current = null;
    tags.forEach((tag, i) => {
        const token = tokens[i];
        if (tag === 'O') {
            current = null;
            return;
        }
        const entity = tag.slice(2);
        if (tag.startsWith('B-') || !current || current.entity !== entity) {
            current = { entity, text: token.text, tokens: [token] };
            spans.push(current);
        }
        else {
            current.tokens.push(token);
            current.text += ' ' + token.text;
        }
    });
    return spans;
}
export class Tagger {
    tagger;
    typer;
    categorizer;
    constructor(tagger, typer, categorizer) {
        this.tagger = tagger;
        this.typer = typer;
        this.categorizer = categorizer;
    }
    tag(text) {
        const tokens = tokenize(text);
        const tags = [];
        for (let i = 0; i < tokens.length; i++) {
            tags.push(this.tagger.predict(tokenFeatures(tokens, i, tags[i - 1] ?? '<s>', tags[i - 2] ?? '<s>')));
        }
        const spans = spansFrom(tokens, tags);
        const typeScores = this.typer.scores(messageFeatures(tokens, tags));
        const type = this.typer.predict(messageFeatures(tokens, tags));
        const cat = spans.find((s) => s.entity === 'CAT');
        let category;
        let categoryMargin = 0;
        if (cat) {
            const feats = categoryFeatures(cat.text, type);
            category = this.categorizer.predict(feats);
            categoryMargin = margin(this.categorizer.scores(feats), category);
        }
        const result = { tokens, tags, spans, type, typeMargin: margin(typeScores, type), categoryMargin };
        if (category)
            result.category = category;
        return result;
    }
    toJSON() {
        return { version: 1, tagger: this.tagger.toJSON(), typer: this.typer.toJSON(), categorizer: this.categorizer.toJSON() };
    }
    static fromJSON(model) {
        return new Tagger(AveragedPerceptron.fromJSON(model.tagger), AveragedPerceptron.fromJSON(model.typer), AveragedPerceptron.fromJSON(model.categorizer));
    }
}
/** Trains on examples whose tags line up with `tokenize(text)`. Shuffles each epoch with a seeded RNG. */
export function train(examples, options) {
    const epochs = options.epochs ?? 8;
    let seed = (options.seed ?? 1) >>> 0;
    const rng = () => {
        seed = (seed + 0x6d2b79f5) >>> 0;
        let t = seed;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const tagger = new AveragedPerceptron(TAGS);
    const typer = new AveragedPerceptron([...MESSAGE_TYPES]);
    const categorizer = new AveragedPerceptron(options.categories);
    const data = examples.map((e) => ({ ...e, tokens: tokenize(e.text) })).filter((e) => e.tokens.length === e.tags.length);
    for (let epoch = 1; epoch <= epochs; epoch++) {
        for (let i = data.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [data[i], data[j]] = [data[j], data[i]];
        }
        let tokenErrors = 0;
        let typeErrors = 0;
        for (const ex of data) {
            const guessed = [];
            for (let i = 0; i < ex.tokens.length; i++) {
                // Features use the model's own previous guesses so training matches prediction.
                const feats = tokenFeatures(ex.tokens, i, guessed[i - 1] ?? '<s>', guessed[i - 2] ?? '<s>');
                const guess = tagger.predict(feats);
                const truth = ex.tags[i];
                tagger.update(truth, guess, feats);
                if (guess !== truth)
                    tokenErrors++;
                guessed.push(guess);
            }
            const mf = messageFeatures(ex.tokens, ex.tags);
            const typeGuess = typer.predict(mf);
            typer.update(ex.type, typeGuess, mf);
            if (typeGuess !== ex.type)
                typeErrors++;
            const cat = spansFrom(ex.tokens, ex.tags).find((s) => s.entity === 'CAT');
            if (cat && ex.category) {
                const cf = categoryFeatures(cat.text, ex.type);
                categorizer.update(ex.category, categorizer.predict(cf), cf);
            }
        }
        options.onEpoch?.(epoch, tokenErrors, typeErrors);
    }
    tagger.average();
    typer.average();
    categorizer.average();
    return new Tagger(tagger, typer, categorizer);
}
