// Price levels as SeriesChart draws them: an open order's limit, a take
// profit or a stop loss, as a line across the plot. Kept apart from the
// component so the fitting and pinning can be tested without a browser.
/**
 * How far outside a series' range a level may be and still widen the view to
 * fit, as a share of the range. Wider than a trade's: a level is a price the
 * trader chose, so seeing it on the scale is worth a little more room, and
 * the series still keeps over 80% of the plot with a level each side.
 */
export const LEVEL_PRICE_TOLERANCE = 0.1;
/**
 * levelsInRange keeps the levels close enough to the range bounds spans to
 * widen it: within `tolerance` of the span below its low or above its high.
 * The rest are pinned to an edge instead, so a far level never flattens the
 * series.
 */
export function levelsInRange(levels, bounds, tolerance = LEVEL_PRICE_TOLERANCE) {
    if (!bounds)
        return [];
    const slack = bounds.span * tolerance;
    const low = bounds.min - slack;
    const high = bounds.min + bounds.span + slack;
    return levels.filter((level) => Number.isFinite(level.value) && level.value >= low && level.value <= high);
}
/**
 * boundsWithLevels widens bounds to take in the levels' values, so a level
 * just outside the plotted prices sits at its true value inside the plot.
 * Pass only levelsInRange, or one far level would flatten the series.
 */
export function boundsWithLevels(bounds, levels) {
    let min = bounds.min;
    let max = bounds.min + bounds.span;
    for (const level of levels) {
        if (level.value < min)
            min = level.value;
        if (level.value > max)
            max = level.value;
    }
    if (min === bounds.min && max === bounds.min + bounds.span)
        return bounds;
    return { min, span: max - min };
}
/** levelPin says a value is above or below the bounds the plot shows, or null when it is on the plot. */
export function levelPin(value, bounds) {
    if (value > bounds.min + bounds.span)
        return 'above';
    if (value < bounds.min)
        return 'below';
    return null;
}
/**
 * placeLevels pins each level outside the bounds the plot shows to the edge
 * it is beyond, keeps the rest at their value, and leaves out levels with no
 * finite value and repeats of a key, which would draw twice.
 */
export function placeLevels(levels, bounds) {
    const seen = new Set();
    const placed = [];
    for (const level of levels) {
        if (!Number.isFinite(level.value) || seen.has(level.key))
            continue;
        seen.add(level.key);
        placed.push({ ...level, pinned: levelPin(level.value, bounds) });
    }
    return placed;
}
/** levelText names a level for screen readers: "Take profit at $0.0123", and "above the chart" when it is pinned. */
export function levelText(level, format) {
    const where = level.pinned === 'above' ? ', above the chart' : level.pinned === 'below' ? ', below the chart' : '';
    return `${level.label} at ${format(level.value)}${where}`;
}
/** levelsSummary is the levels as sentences, for the chart's description: "Take profit at $0.0123. Stop loss at $0.0100.", or '' with none. */
export function levelsSummary(levels, format) {
    return levels.map((level) => `${levelText(level, format)}.`).join(' ');
}
/**
 * stackLabels moves labels apart so none covers another: given where each
 * label would sit, its centre's y in pixels, and how tall a label is, it
 * keeps their order and pushes each clear of the one above, and keeps them
 * all between `top` and `bottom`, pushing up from the bottom when they run
 * past it. The result is in the order given.
 */
export function stackLabels(wanted, height, top, bottom) {
    const half = height / 2;
    const order = wanted.map((y, index) => ({ y, index })).sort((a, b) => a.y - b.y || a.index - b.index);
    const placed = order.map((entry) => Math.min(Math.max(entry.y, top + half), bottom - half));
    for (let i = 1; i < placed.length; i++)
        placed[i] = Math.max(placed[i], placed[i - 1] + height);
    for (let i = placed.length - 1; i >= 0; i--) {
        const limit = i === placed.length - 1 ? bottom - half : placed[i + 1] - height;
        if (placed[i] > limit)
            placed[i] = limit;
    }
    const result = new Array(wanted.length);
    order.forEach((entry, i) => (result[entry.index] = placed[i]));
    return result;
}
