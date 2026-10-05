// The placement and inspection maths behind SeriesChart, kept apart from the
// component so it can be tested without a browser.
/**
 * plotPoints places points along the x axis and splits them into runs, each
 * drawn as one line. byTime places them by their time, so gaps show, unless
 * they all share one time; with byTime, a gap wider than `gap` ms starts a new
 * run. Fewer than two points draw nothing.
 */
export function plotPoints(points, byTime, gap) {
    if (points.length < 2)
        return [];
    const placeByTime = byTime && points[points.length - 1].t > points[0].t;
    let run = 0;
    return points.map((point, index) => {
        if (index > 0 && byTime && gap > 0 && point.t - points[index - 1].t > gap)
            run++;
        return { ...point, x: placeByTime ? point.t : index, run };
    });
}
/** lonePoints are runs of a single point, which a line alone would not show. */
export function lonePoints(plotted) {
    return plotted.filter((point, index) => plotted[index - 1]?.run !== point.run && plotted[index + 1]?.run !== point.run);
}
/** isCandle says a point carries what a candle needs: an open, a high and a low. */
export function isCandle(point) {
    return point.o != null && point.h != null && point.l != null;
}
/** candleTrend says a candle closed at or above its open, drawn hollow, or below it, drawn filled. */
export function candleTrend(point) {
    return point.p >= point.o ? 'rise' : 'fall';
}
/** candleReading names a candle's values in order for a screen reader: "open 1, high 2, low 0.5, close 1.5". */
export function candleReading(point, format) {
    return `open ${format(point.o)}, high ${format(point.h)}, low ${format(point.l)}, close ${format(point.p)}`;
}
/** hasCandles says every point can be drawn as a candle. */
export function hasCandles(points) {
    return points.length > 0 && points.every(isCandle);
}
/**
 * valueBounds is the range of values to fit. It comes from the data rather
 * than anchoring at zero: these tokens move by fractions of a cent, and a zero
 * baseline would flatten every chart into a straight line. A baseline chart is
 * about zero, so zero is always in view. Candles fit their highs and lows. A
 * flat line keeps a nonzero span, with the line along the bottom.
 */
export function valueBounds(points, baseline, candles = false) {
    if (points.length === 0)
        return null;
    const values = candles ? points.flatMap((point) => (isCandle(point) ? [point.l, point.h] : [point.p])) : points.map((point) => point.p);
    if (baseline)
        values.push(0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { min, span: max - min || Math.abs(max) || 1 };
}
/**
 * guideValues are a few round values across a range, for the horizontal
 * guides and their labels: at most `count`, at a step of 1, 2 or 5 times a
 * power of ten, and all inside the range.
 */
export function guideValues(min, span, count = 3) {
    if (!(span > 0) || count < 1)
        return [];
    const rough = span / count;
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const step = [1, 2, 5, 10].map((unit) => unit * magnitude).find((candidate) => candidate >= rough) ?? 10 * magnitude;
    const values = [];
    for (let value = Math.ceil(min / step) * step; value <= min + span + step / 1e6; value += step) {
        // Snap away the float drift of the sum, so $0.30 never reads $0.30000000000000004.
        values.push(Number(value.toPrecision(12)));
    }
    return values;
}
/** Below this plot height, in pixels, the guides keep one label at most. */
export const SHORT_PLOT_HEIGHT = 150;
/**
 * guideLabels picks the guides that get a label, given each guide's value and
 * its y in pixels on a plot this tall. A label sits just above its guide, so
 * one whose guide falls in the bottom `reserved` pixels, where the time axis
 * runs, is left out. A plot shorter than SHORT_PLOT_HEIGHT has no room for
 * more than one, so it keeps the label nearest the middle of the space left.
 */
export function guideLabels(guides, plotHeight, reserved = 0) {
    const room = plotHeight - reserved;
    const fitting = guides.filter((guide) => guide.y <= room);
    if (plotHeight >= SHORT_PLOT_HEIGHT || fitting.length <= 1)
        return fitting.map((guide) => guide.value);
    const middle = room / 2;
    const nearest = fitting.reduce((best, guide) => (Math.abs(guide.y - middle) < Math.abs(best.y - middle) ? guide : best));
    return [nearest.value];
}
/**
 * timeTicks picks evenly spread points for the time axis: the first, the
 * last and up to `count` between, so the labels say where the range runs.
 */
export function timeTicks(plotted, count = 2) {
    if (plotted.length < 2)
        return plotted;
    const last = plotted.length - 1;
    const ticks = new Set([0, last]);
    for (let i = 1; i <= count; i++)
        ticks.add(Math.round((last * i) / (count + 1)));
    return [...ticks].sort((a, b) => a - b).map((index) => plotted[index]);
}
/**
 * candleWidth is how wide a candle's body is, in pixels, for a plot this wide
 * holding this many candles, leaving a gap between neighbours and never so
 * thin it vanishes or so wide it looks like a bar chart. SeriesChart no
 * longer uses it, since Lightweight Charts sizes its candles, but it stays
 * exported for code that draws its own.
 */
export function candleWidth(plotWidth, count) {
    if (count < 1 || plotWidth <= 0)
        return 1;
    return Math.max(1, Math.min(14, Math.floor((plotWidth / count) * 0.65)));
}
/**
 * nearestIndex is the plotted point closest to x, in the chart's x units.
 * Points are in x order, so it bisects.
 */
export function nearestIndex(plotted, x) {
    let low = 0;
    let high = plotted.length - 1;
    while (high - low > 1) {
        const middle = (low + high) >> 1;
        if (plotted[middle].x <= x)
            low = middle;
        else
            high = middle;
    }
    return Math.abs(plotted[high].x - x) < Math.abs(plotted[low].x - x) ? high : low;
}
/**
 * carriedIndex is where an inspected point sits once new points arrive: the
 * index of the point with the same time, so a live tick leaves a keyboard or
 * touch inspection where it was. When that time is gone, as when another
 * range arrives, it is null and the inspection ends.
 */
export function carriedIndex(previous, next, index) {
    if (index == null)
        return null;
    const time = previous[index]?.t;
    if (time == null)
        return null;
    if (next[index]?.t === time)
        return index;
    const found = next.findIndex((point) => point.t === time);
    return found === -1 ? null : found;
}
/**
 * inGap says x falls in a gap in the line: placed by time, its nearest point
 * is more than half a gap away, so no snapshot stands for that moment.
 */
export function inGap(point, x, byTime, gap) {
    return byTime && gap > 0 && Math.abs(point.t - x) > gap / 2;
}
/**
 * inspectHint says how to inspect a chart while nothing is inspected. A
 * pointer hovers or drags; a finger can only drag, so a touch screen leaves
 * hovering out. noun is what a point is: "price", "value", "day". With
 * markers it also says how to see a trade.
 */
export function inspectHint(noun, withMarkers, touch) {
    const verb = touch ? 'Tap or drag' : 'Hover or drag';
    if (withMarkers)
        return `${verb} to see a ${noun}. Select a marker to see the trade.`;
    return `${verb} across the chart to see a ${noun}.`;
}
/** A marker's identity: what it shows and when. */
export function markerKey(marker) {
    return `${marker.t}|${marker.title}`;
}
/**
 * markersInTime keeps the markers within the points' time range, each with how
 * far along it sits in time, from 0 to 1; SeriesChart places them between
 * their neighbouring points with slotAtTime instead. Price history is cached and sampled, so it
 * usually ends a little before now; trades since then pin to the right edge
 * instead of vanishing. Markers that show the same thing at the same time
 * would sit on top of each other, so only the first is kept.
 */
export function markersInTime(points, markers, now = Date.now()) {
    if (points.length < 2)
        return [];
    const firstTime = points[0].t;
    const lastTime = points[points.length - 1].t;
    if (lastTime <= firstTime)
        return [];
    const seen = new Set();
    return markers
        .filter((marker) => marker.t >= firstTime && marker.t <= Math.max(lastTime, now))
        .filter((marker) => {
        const key = markerKey(marker);
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    })
        .map((marker) => ({ ...marker, along: Math.min(1, (marker.t - firstTime) / (lastTime - firstTime)) }));
}
/**
 * withinPlotHeight says a marker at top pixels from the top of a plot this
 * tall is close enough to the plotted range to show: a trade can fill a
 * little outside the sampled prices, but not far.
 */
export function withinPlotHeight(top, plotHeight, tolerance = 0.05) {
    return top >= -tolerance * plotHeight && top <= (1 + tolerance) * plotHeight;
}
/**
 * The most slots a chart placed by time spreads its points across, on top of
 * one per point, so a long range with a few close points stays cheap to draw.
 */
export const MAX_TIME_SLOTS = 4000;
/**
 * chartSlots places each plotted point in a slot of the chart's time scale,
 * which Lightweight Charts draws evenly spaced. Placed evenly, point i is
 * slot i. Placed by time, slots follow time, with the closest neighbours one
 * slot apart and never finer than the span over maxSlots, so gaps show as
 * space; every point gets its own slot, and a gap wider than `gap` ms leaves
 * at least one empty slot, which breaks the line there.
 */
export function chartSlots(plotted, byTime, gap, maxSlots = MAX_TIME_SLOTS) {
    if (plotted.length === 0)
        return [];
    const first = plotted[0].t;
    const span = plotted[plotted.length - 1].t - first;
    if (!byTime || !(span > 0))
        return plotted.map((_, index) => index);
    let step = Infinity;
    for (let index = 1; index < plotted.length; index++) {
        const between = plotted[index].t - plotted[index - 1].t;
        if (between > 0 && between < step)
            step = between;
    }
    step = Math.max(step, span / maxSlots);
    const slots = [];
    for (let index = 0; index < plotted.length; index++) {
        const ideal = Math.round((plotted[index].t - first) / step);
        if (index === 0) {
            slots.push(ideal);
            continue;
        }
        const breaks = plotted[index].run !== plotted[index - 1].run;
        slots.push(Math.max(ideal, slots[index - 1] + (breaks ? 2 : 1)));
    }
    return slots;
}
/**
 * chartRows fills every slot from the first point's to the last's. A point's
 * slot holds the point. Between two points of one run, a line's slots hold
 * values on the straight line between them, so the line looks unbroken
 * however far apart they sit; between runs, and between candles, slots stay
 * empty, which shows as a break or a space.
 */
export function chartRows(plotted, slots, candles) {
    const rows = [];
    for (let index = 0; index < plotted.length; index++) {
        const point = plotted[index];
        const slot = slots[index];
        if (candles && isCandle(point))
            rows.push({ time: slot + 1, open: point.o, high: point.h, low: point.l, close: point.p });
        else
            rows.push({ time: slot + 1, value: point.p });
        const next = plotted[index + 1];
        if (!next)
            break;
        const nextSlot = slots[index + 1];
        const joined = !candles && next.run === point.run;
        for (let between = slot + 1; between < nextSlot; between++) {
            if (!joined) {
                rows.push({ time: between + 1 });
                continue;
            }
            const fraction = (between - slot) / (nextSlot - slot);
            rows.push({ time: between + 1, value: point.p + (next.p - point.p) * fraction });
        }
    }
    return rows;
}
/** bracketIndex is the last index whose value is at or before target, in an ascending list, or -1. */
function bracketIndex(count, valueAt, target) {
    let low = 0;
    let high = count - 1;
    if (count === 0 || target < valueAt(0))
        return -1;
    while (low < high) {
        const middle = (low + high + 1) >> 1;
        if (valueAt(middle) <= target)
            low = middle;
        else
            high = middle - 1;
    }
    return low;
}
/**
 * slotAtTime is where a moment falls on the time scale, as a fractional
 * slot: between the slots of the points either side of it, in proportion to
 * time. A moment before the first point is the first slot, and after the
 * last, as a trade since the last sample, the last slot.
 */
export function slotAtTime(plotted, slots, t) {
    if (plotted.length === 0)
        return 0;
    const last = plotted.length - 1;
    if (t <= plotted[0].t)
        return slots[0];
    if (t >= plotted[last].t)
        return slots[last];
    const index = bracketIndex(plotted.length, (at) => plotted[at].t, t);
    const from = plotted[index];
    const to = plotted[index + 1];
    const fraction = to.t > from.t ? (t - from.t) / (to.t - from.t) : 0;
    return slots[index] + (slots[index + 1] - slots[index]) * fraction;
}
/**
 * xAtSlot turns a fractional slot, such as one under the pointer, back into
 * the chart's x units, a time or an index as plotPoints placed them, so
 * nearestIndex and inGap work on it. It is clamped to the plotted range.
 */
export function xAtSlot(plotted, slots, slot) {
    if (plotted.length === 0)
        return 0;
    const last = plotted.length - 1;
    if (slot <= slots[0])
        return plotted[0].x;
    if (slot >= slots[last])
        return plotted[last].x;
    const index = bracketIndex(slots.length, (at) => slots[at], slot);
    const from = slots[index];
    const to = slots[index + 1];
    const fraction = to > from ? (slot - from) / (to - from) : 0;
    return plotted[index].x + (plotted[index + 1].x - plotted[index].x) * fraction;
}
/**
 * seriesSummary describes a whole series in a sentence for screen readers,
 * as the chart's description: its span, how many points, where it started
 * and ended, and its high and low. Candles read their first open and last
 * close, and the highs and lows of the candles.
 */
export function seriesSummary(points, candles, format, formatTime, withYear) {
    if (points.length < 2)
        return '';
    const first = points[0];
    const last = points[points.length - 1];
    const highs = candles ? points.map((point) => point.h ?? point.p) : points.map((point) => point.p);
    const lows = candles ? points.map((point) => point.l ?? point.p) : points.map((point) => point.p);
    const span = `From ${formatTime(first.t, withYear)} to ${formatTime(last.t, withYear)}`;
    const count = `${points.length} ${candles ? 'candles' : 'points'}`;
    const ends = candles ? `opened at ${format(first.o ?? first.p)}, closed at ${format(last.p)}` : `started at ${format(first.p)}, ended at ${format(last.p)}`;
    return `${span}: ${count}, ${ends}, high ${format(Math.max(...highs))}, low ${format(Math.min(...lows))}.`;
}
/**
 * colorWithAlpha is a colour token at this opacity, for the canvas, which
 * cannot read CSS variables or mix colours: "#1d7a4c" at 0.28 is
 * "rgba(29, 122, 76, 0.28)". Hex and rgb() colours are mixed; any other
 * colour comes back as it is.
 */
export function colorWithAlpha(color, alpha) {
    const value = color.trim();
    const hex = value.match(/^#([0-9a-f]{3,8})$/i)?.[1];
    if (hex && (hex.length === 3 || hex.length === 6 || hex.length === 8)) {
        const full = hex.length === 3 ? [...hex].map((digit) => digit + digit).join('') : hex.slice(0, 6);
        const [red, green, blue] = [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16));
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
    const channels = value.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (channels)
        return `rgba(${channels[1]}, ${channels[2]}, ${channels[3]}, ${alpha})`;
    return value;
}
