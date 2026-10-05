/** One point of a series: a value at a time, and for a candle its open, high and low, and volume. */
export type SeriesPoint = {
    t: number;
    p: number;
    o?: number;
    h?: number;
    l?: number;
    v?: number;
};
/**
 * A trade on a chart. note is a short extra line when it is picked, such as
 * the change since a buy. avatar is the trader's picture, a person's or a
 * bot's, drawn in the marker; name gives initials when there is no picture
 * or it fails to load. Neither is required: without both, the marker is the
 * buy or sell shape.
 */
export type SeriesMarker = {
    t: number;
    price: number;
    side: 'buy' | 'sell';
    title: string;
    note?: {
        text: string;
        up: boolean;
    };
    avatar?: string;
    name?: string;
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
/** candleTrend says a candle closed at or above its open, drawn hollow, or below it, drawn filled. */
export declare function candleTrend(point: SeriesPoint & {
    o: number;
}): 'rise' | 'fall';
/** candleReading names a candle's values in order for a screen reader: "open 1, high 2, low 0.5, close 1.5". */
export declare function candleReading(point: SeriesPoint & {
    o: number;
    h: number;
    l: number;
}, format: (n: number) => string): string;
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
/** Below this plot height, in pixels, the guides keep one label at most. */
export declare const SHORT_PLOT_HEIGHT = 150;
/**
 * guideLabels picks the guides that get a label, given each guide's value and
 * its y in pixels on a plot this tall. A label sits just above its guide, so
 * one whose guide falls in the bottom `reserved` pixels, where the time axis
 * runs, is left out. A plot shorter than SHORT_PLOT_HEIGHT has no room for
 * more than one, so it keeps the label nearest the middle of the space left.
 */
export declare function guideLabels(guides: {
    value: number;
    y: number;
}[], plotHeight: number, reserved?: number): number[];
/**
 * timeTicks picks evenly spread points for the time axis: the first, the
 * last and up to `count` between, so the labels say where the range runs.
 */
export declare function timeTicks(plotted: PlottedPoint[], count?: number): PlottedPoint[];
/**
 * candleWidth is how wide a candle's body is, in pixels, for a plot this wide
 * holding this many candles, leaving a gap between neighbours and never so
 * thin it vanishes or so wide it looks like a bar chart. SeriesChart no
 * longer uses it, since Lightweight Charts sizes its candles, but it stays
 * exported for code that draws its own.
 */
export declare function candleWidth(plotWidth: number, count: number): number;
/**
 * nearestIndex is the plotted point closest to x, in the chart's x units.
 * Points are in x order, so it bisects.
 */
export declare function nearestIndex(plotted: PlottedPoint[], x: number): number;
/**
 * carriedIndex is where an inspected point sits once new points arrive: the
 * index of the point with the same time, so a live tick leaves a keyboard or
 * touch inspection where it was. When that time is gone, as when another
 * range arrives, it is null and the inspection ends.
 */
export declare function carriedIndex(previous: SeriesPoint[], next: SeriesPoint[], index: number | null): number | null;
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
 * far along it sits in time, from 0 to 1; SeriesChart places them between
 * their neighbouring points with slotAtTime instead. Price history is cached and sampled, so it
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
/**
 * The most slots a chart placed by time spreads its points across, on top of
 * one per point, so a long range with a few close points stays cheap to draw.
 */
export declare const MAX_TIME_SLOTS = 4000;
/**
 * chartSlots places each plotted point in a slot of the chart's time scale,
 * which Lightweight Charts draws evenly spaced. Placed evenly, point i is
 * slot i. Placed by time, slots follow time, with the closest neighbours one
 * slot apart and never finer than the span over maxSlots, so gaps show as
 * space; every point gets its own slot, and a gap wider than `gap` ms leaves
 * at least one empty slot, which breaks the line there.
 */
export declare function chartSlots(plotted: PlottedPoint[], byTime: boolean, gap: number, maxSlots?: number): number[];
/**
 * One slot of the chart's time scale, in the shape Lightweight Charts takes:
 * time is the slot number plus one, as it needs unique ascending times; a
 * line slot has a value, a candle slot open, high, low and close, and an
 * empty slot neither.
 */
export type ChartRow = {
    time: number;
    value?: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
};
/**
 * chartRows fills every slot from the first point's to the last's. A point's
 * slot holds the point. Between two points of one run, a line's slots hold
 * values on the straight line between them, so the line looks unbroken
 * however far apart they sit; between runs, and between candles, slots stay
 * empty, which shows as a break or a space.
 */
export declare function chartRows(plotted: PlottedPoint[], slots: number[], candles: boolean): ChartRow[];
/**
 * slotAtTime is where a moment falls on the time scale, as a fractional
 * slot: between the slots of the points either side of it, in proportion to
 * time. A moment before the first point is the first slot, and after the
 * last, as a trade since the last sample, the last slot.
 */
export declare function slotAtTime(plotted: PlottedPoint[], slots: number[], t: number): number;
/**
 * xAtSlot turns a fractional slot, such as one under the pointer, back into
 * the chart's x units, a time or an index as plotPoints placed them, so
 * nearestIndex and inGap work on it. It is clamped to the plotted range.
 */
export declare function xAtSlot(plotted: PlottedPoint[], slots: number[], slot: number): number;
/**
 * seriesSummary describes a whole series in a sentence for screen readers,
 * as the chart's description: its span, how many points, where it started
 * and ended, and its high and low. Candles read their first open and last
 * close, and the highs and lows of the candles.
 */
export declare function seriesSummary(points: SeriesPoint[], candles: boolean, format: (n: number) => string, formatTime: (t: number, withYear: boolean) => string, withYear: boolean): string;
/**
 * colorWithAlpha is a colour token at this opacity, for the canvas, which
 * cannot read CSS variables or mix colours: "#1d7a4c" at 0.28 is
 * "rgba(29, 122, 76, 0.28)". Hex and rgb() colours are mixed; any other
 * colour comes back as it is.
 */
export declare function colorWithAlpha(color: string, alpha: number): string;
