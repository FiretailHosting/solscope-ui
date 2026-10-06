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
/**
 * The least height of a SeriesChart's plot, in pixels, whatever its width:
 * a plot that scales with its width would be under 100px tall in a 300px
 * card, too short to read a price or fit its levels' tags.
 */
export declare const SERIES_CHART_MIN_HEIGHT = 220;
/**
 * seriesMinHeight is the least height SeriesChart gives a plot that scales
 * with its width, by default: SERIES_CHART_MIN_HEIGHT, or `height` when that
 * is less, so a short chart never grows past the height it asked for. A
 * stand-in for the chart takes the same, so nothing moves when it lands.
 */
export declare function seriesMinHeight(height: number): number;
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
 * thin it vanishes or so wide it looks like a bar chart.
 */
export declare function candleWidth(plotWidth: number, count: number): number;
/**
 * candleWidthByStep is how wide a candle's body is, in pixels, for candles
 * placed by time: from the smallest distance between two neighbours, so
 * candles close in time never overlap, never thinner than 1 or wider than
 * 14, as candleWidth. xs are the candles' x values in order, and the plot
 * is plotWidth pixels across from the first to the last.
 */
export declare function candleWidthByStep(plotWidth: number, xs: number[]): number;
/** Below this body width, in pixels, a candle is a line: too narrow to show hollow or filled. */
export declare const THIN_CANDLE_WIDTH = 3;
/** Below this body height, in pixels, a candle's body is a level line: it opened and closed at about the same price. */
export declare const FLAT_CANDLE_HEIGHT = 2;
/**
 * How a candle is drawn, in pixels. A thin one is a 1px line from high to
 * low with a 2px line over its body, since a body under THIN_CANDLE_WIDTH
 * cannot show hollow or filled, so colour alone tells rise from fall there
 * and the readout names it. A flat one, a doji, is a wick straight through
 * a level line across the body's width. Any other is a body box with a wick
 * above and below it, hollow when rising.
 */
export type CandleMarks = {
    kind: 'thin';
    x: number;
    high: number;
    low: number;
    top: number;
    bottom: number;
} | {
    kind: 'flat';
    x: number;
    high: number;
    low: number;
    y: number;
    left: number;
    right: number;
} | {
    kind: 'body';
    x: number;
    high: number;
    low: number;
    top: number;
    bottom: number;
    left: number;
    width: number;
};
/**
 * candleMarks places one candle: its centre x, the y of its high, low, and
 * body top and bottom, as the y scale gives them, and its body width.
 */
export declare function candleMarks(x: number, high: number, low: number, top: number, bottom: number, width: number): CandleMarks;
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
 * pointer hovers or drags, and a keyboard uses the arrow keys; a finger can
 * only drag, so a touch screen leaves hovering and keys out. noun is what a point is: "price", "value", "day". With
 * markers it also says how to see a trade.
 */
export declare function inspectHint(noun: string, withMarkers: boolean, touch: boolean): string;
/** A marker's identity: what it shows and when. */
export declare function markerKey(marker: SeriesMarker): string;
/**
 * markersInTime keeps the markers within the points' time range, each with how
 * far along it sits in time, from 0 to 1; SeriesChart places them between
 * their neighbouring points with xAtTime instead. Price history is cached and sampled, so it
 * usually ends a little before now; trades since then pin to the right edge
 * instead of vanishing. Markers that show the same thing at the same time
 * would sit on top of each other, so only the first is kept.
 */
export declare function markersInTime(points: SeriesPoint[], markers: SeriesMarker[], now?: number): (SeriesMarker & {
    along: number;
})[];
/** How far outside a series' range a trade's price may be and still show, as a share of the range. */
export declare const MARKER_PRICE_TOLERANCE = 0.05;
/**
 * markersInRange keeps the markers priced close enough to the range bounds
 * spans to show: a trade can fill a little outside the sampled prices, as a
 * fill just under a 1-minute candle's low, but not far. Close is within
 * `tolerance` of the span below its low or above its high.
 */
export declare function markersInRange<Marker extends Pick<SeriesMarker, 'price'>>(markers: Marker[], bounds: {
    min: number;
    span: number;
} | null, tolerance?: number): Marker[];
/**
 * boundsWithMarkers widens bounds to take in the markers' prices, so a trade
 * priced just outside the plotted range is fitted into the plot at its true
 * price, rather than drawn over the time axis or below the plot. Pass only
 * markersInRange, or one stray price would flatten the series.
 */
export declare function boundsWithMarkers(bounds: {
    min: number;
    span: number;
}, markers: Pick<SeriesMarker, 'price'>[]): {
    min: number;
    span: number;
};
/**
 * withinPlotHeight says a marker at top pixels from the top of a plot this
 * tall is close enough to the plotted range to show: a trade can fill a
 * little outside the sampled prices, but not far. SeriesChart no longer uses
 * it, since it fits such trades into the plot with markersInRange and
 * boundsWithMarkers, but it stays exported for code that places its own.
 */
export declare function withinPlotHeight(top: number, plotHeight: number, tolerance?: number): boolean;
/**
 * xAtTime is where a moment falls along the x axis, in the chart's x units
 * as plotPoints placed them. Placed by time, it is the moment itself;
 * placed evenly, it falls between the indexes of the points either side of
 * it, in proportion to time. A moment before the first point is the first
 * point's x, and after the last, as a trade since the last sample, the
 * last's.
 */
export declare function xAtTime(plotted: PlottedPoint[], t: number): number;
/**
 * seriesSummary describes a whole series in a sentence for screen readers,
 * as the chart's description: its span, how many points, where it started
 * and ended, and its high and low. Candles read their first open and last
 * close, and the highs and lows of the candles.
 */
export declare function seriesSummary(points: SeriesPoint[], candles: boolean, format: (n: number) => string, formatTime: (t: number, withYear: boolean) => string, withYear: boolean): string;
