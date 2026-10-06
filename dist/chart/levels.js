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
/**
 * layoutLevelTags places the level tags at the right edge between `top` and
 * `bottom`, each `height` pixels apart. A level pinned beyond an edge joins
 * that edge's group, shown as one chip in the edge's slot rather than a tag
 * each, so far levels never stack over the series. When the tags on the
 * plot still do not fit in the slots left, the outermost go into a group
 * too, the one already there first, so no tag is ever pushed off the plot.
 * The tags left keep their order and move apart with stackLabels.
 */
export function layoutLevelTags(levels, height, top, bottom) {
    const above = [];
    const below = [];
    const tagged = [];
    levels.forEach((level, index) => (level.pinned === 'above' ? above : level.pinned === 'below' ? below : tagged).push(index));
    tagged.sort((a, b) => levels[a].wanted - levels[b].wanted || a - b);
    const room = () => bottom - top - (above.length > 0 ? height : 0) - (below.length > 0 ? height : 0);
    while (tagged.length > 0 && tagged.length * height > room()) {
        const first = tagged[0];
        const last = tagged[tagged.length - 1];
        let edge;
        if (above.length > 0 && below.length === 0)
            edge = 'above';
        else if (below.length > 0 && above.length === 0)
            edge = 'below';
        else
            edge = levels[first].wanted - top <= bottom - levels[last].wanted ? 'above' : 'below';
        if (edge === 'above')
            above.push(tagged.shift());
        else
            below.push(tagged.pop());
    }
    const highestFirst = (a, b) => levels[b].value - levels[a].value || a - b;
    above.sort(highestFirst);
    below.sort(highestFirst);
    const aboveChip = above.length > 0 ? top + height / 2 : null;
    const belowChip = below.length > 0 ? bottom - height / 2 : null;
    const tags = new Array(levels.length).fill(null);
    const stacked = stackLabels(tagged.map((index) => levels[index].wanted), height, top + (aboveChip == null ? 0 : height), bottom - (belowChip == null ? 0 : height));
    tagged.forEach((index, i) => (tags[index] = stacked[i]));
    return { tags, above, below, aboveChip, belowChip };
}
/**
 * levelGroupText says an edge group of levels in words, so the arrow's
 * direction never rests on colour or shape alone: `chip` on the chip, "6
 * below"; `name`, the chip's accessible name, which starts with the chip's
 * words, "6 below the chart"; and `heading`, read when the list opens, "6
 * levels below the chart". A group that holds levels on the plot, whose
 * tags had no room, says "3 more" and "at the top" or "at the bottom".
 */
export function levelGroupText(edge, members) {
    const count = members.length;
    const levels = count === 1 ? 'level' : 'levels';
    if (members.every((member) => member.pinned === edge)) {
        const where = `${edge} the chart`;
        return { chip: `${count} ${edge}`, name: `${count} ${where}`, heading: `${count} ${levels} ${where}` };
    }
    const where = edge === 'above' ? 'at the top' : 'at the bottom';
    return { chip: `${count} more`, name: `${count} more ${levels} ${where}`, heading: `${count} more ${levels} ${where}` };
}
