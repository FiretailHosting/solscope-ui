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
 * thin it vanishes or so wide it looks like a bar chart.
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
        return `${verb} to see a ${noun}. Select a dot to see the trade.`;
    return `${verb} across the chart to see a ${noun}.`;
}
/** A marker's identity: what it shows and when. */
export function markerKey(marker) {
    return `${marker.t}|${marker.title}`;
}
/**
 * markersInTime keeps the markers within the points' time range, each with how
 * far along it sits, from 0 to 1. Price history is cached and sampled, so it
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
