/** One point of a series: a value at a time, and for a candle its open, high and low, and volume. */
export type SeriesPoint = {
    t: number;
    p: number;
    o?: number;
    h?: number;
    l?: number;
    v?: number;
};
/** A trade on a chart. note is a short extra line when it is picked, such as the change since a buy. */
export type SeriesMarker = {
    t: number;
    price: number;
    side: 'buy' | 'sell';
    title: string;
    note?: {
        text: string;
        up: boolean;
    };
};
/** A point as drawn: x is its time when placed by time, else its index; run numbers the line it belongs to. */
export type PlottedPoint = SeriesPoint & {
    x: number;
    run: number;
};
/**
 * plotPoints places points along the x axis and splits them into runs, each
 * drawn as one line. byTime places them by their time, so gaps show, unless
 * they all share one time; with byTime, a gap wider than `gap` ms starts a new
 * run. Fewer than two points draw nothing.
 */
export declare function plotPoints(points: SeriesPoint[], byTime: boolean, gap: number): PlottedPoint[];
/** lonePoints are runs of a single point, which a line alone would not show. */
export declare function lonePoints(plotted: PlottedPoint[]): PlottedPoint[];
/** isCandle says a point carries what a candle needs: an open, a high and a low. */
export declare function isCandle(point: SeriesPoint): point is SeriesPoint & {
    o: number;
    h: number;
    l: number;
};
/** hasCandles says every point can be drawn as a candle. */
export declare function hasCandles(points: SeriesPoint[]): boolean;
/**
 * valueBounds is the range of values to fit. It comes from the data rather
 * than anchoring at zero: these tokens move by fractions of a cent, and a zero
 * baseline would flatten every chart into a straight line. A baseline chart is
 * about zero, so zero is always in view. Candles fit their highs and lows. A
 * flat line keeps a nonzero span, with the line along the bottom.
 */
export declare function valueBounds(points: SeriesPoint[], baseline: boolean, candles?: boolean): {
    min: number;
    span: number;
} | null;
/**
 * guideValues are a few round values across a range, for the horizontal
 * guides and their labels: at most `count`, at a step of 1, 2 or 5 times a
 * power of ten, and all inside the range.
 */
export declare function guideValues(min: number, span: number, count?: number): number[];
/**
 * timeTicks picks evenly spread points for the time axis: the first, the
 * last and up to `count` between, so the labels say where the range runs.
 */
export declare function timeTicks(plotted: PlottedPoint[], count?: number): PlottedPoint[];
/**
 * candleWidth is how wide a candle's body is, in pixels, for a plot this wide
 * holding this many candles, leaving a gap between neighbours and never so
 * thin it vanishes or so wide it looks like a bar chart.
 */
export declare function candleWidth(plotWidth: number, count: number): number;
/**
 * nearestIndex is the plotted point closest to x, in the chart's x units.
 * Points are in x order, so it bisects.
 */
export declare function nearestIndex(plotted: PlottedPoint[], x: number): number;
/**
 * inGap says x falls in a gap in the line: placed by time, its nearest point
 * is more than half a gap away, so no snapshot stands for that moment.
 */
export declare function inGap(point: PlottedPoint, x: number, byTime: boolean, gap: number): boolean;
/**
 * inspectHint says how to inspect a chart while nothing is inspected. A
 * pointer hovers or drags; a finger can only drag, so a touch screen leaves
 * hovering out. noun is what a point is: "price", "value", "day". With
 * markers it also says how to see a trade.
 */
export declare function inspectHint(noun: string, withMarkers: boolean, touch: boolean): string;
/** A marker's identity: what it shows and when. */
export declare function markerKey(marker: SeriesMarker): string;
/**
 * markersInTime keeps the markers within the points' time range, each with how
 * far along it sits, from 0 to 1. Price history is cached and sampled, so it
 * usually ends a little before now; trades since then pin to the right edge
 * instead of vanishing. Markers that show the same thing at the same time
 * would sit on top of each other, so only the first is kept.
 */
export declare function markersInTime(points: SeriesPoint[], markers: SeriesMarker[], now?: number): (SeriesMarker & {
    along: number;
})[];
/**
 * withinPlotHeight says a marker at top pixels from the top of a plot this
 * tall is close enough to the plotted range to show: a trade can fill a
 * little outside the sampled prices, but not far.
 */
export declare function withinPlotHeight(top: number, plotHeight: number, tolerance?: number): boolean;
