export class AveragedPerceptron {
    weights = new Map();
    totals = new Map();
    stamps = new Map();
    step = 0;
    labels;
    constructor(labels) {
        this.labels = labels;
    }
    scores(features) {
        const s = new Map(this.labels.map((l) => [l, 0]));
        for (const f of features) {
            const w = this.weights.get(f);
            if (!w)
                continue;
            for (const [label, weight] of w)
                s.set(label, (s.get(label) ?? 0) + weight);
        }
        return s;
    }
    predict(features) {
        const s = this.scores(features);
        let best = this.labels[0];
        let bestScore = -Infinity;
        for (const [label, score] of s) {
            if (score > bestScore) {
                best = label;
                bestScore = score;
            }
        }
        return best;
    }
    update(truth, guess, features) {
        this.step++;
        if (truth === guess)
            return;
        for (const f of features) {
            this.adjust(f, truth, 1);
            this.adjust(f, guess, -1);
        }
    }
    adjust(feature, label, delta) {
        const w = this.weights.get(feature) ?? new Map();
        const t = this.totals.get(feature) ?? new Map();
        const s = this.stamps.get(feature) ?? new Map();
        const current = w.get(label) ?? 0;
        t.set(label, (t.get(label) ?? 0) + (this.step - (s.get(label) ?? 0)) * current);
        s.set(label, this.step);
        w.set(label, current + delta);
        this.weights.set(feature, w);
        this.totals.set(feature, t);
        this.stamps.set(feature, s);
    }
    /** Replaces the weights with their running averages. Call once, after the last epoch. */
    average() {
        for (const [feature, w] of this.weights) {
            const t = this.totals.get(feature);
            const s = this.stamps.get(feature);
            for (const [label, weight] of w) {
                const total = (t.get(label) ?? 0) + (this.step - (s.get(label) ?? 0)) * weight;
                const avg = total / this.step;
                if (Math.abs(avg) < 1e-6)
                    w.delete(label);
                else
                    w.set(label, Math.round(avg * 1000) / 1000);
            }
        }
    }
    toJSON() {
        const weights = {};
        for (const [feature, w] of this.weights) {
            if (!w.size)
                continue;
            weights[feature] = Object.fromEntries(w);
        }
        return { labels: this.labels, weights };
    }
    static fromJSON(model) {
        const p = new AveragedPerceptron(model.labels);
        for (const [feature, w] of Object.entries(model.weights))
            p.weights.set(feature, new Map(Object.entries(w)));
        return p;
    }
}
