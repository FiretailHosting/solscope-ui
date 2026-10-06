// The placement and inspection maths behind SeriesChart, kept apart from the
// component so it can be tested without a browser.

/** One point of a series: a value at a time, and for a candle its open, high and low, and volume. */
export type SeriesPoint = { t: number; p: number; o?: number; h?: number; l?: number; v?: number };

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
	note?: { text: string; up: boolean };
	avatar?: string;
	name?: string;
};

/** A point as drawn: x is its time when placed by time, else its index; run numbers the line it belongs to. */
export type PlottedPoint = SeriesPoint & { x: number; run: number };

/**
 * plotPoints places points along the x axis and splits them into runs, each
 * drawn as one line. byTime places them by their time, so gaps show, unless
 * they all share one time; with byTime, a gap wider than `gap` ms starts a new
 * run. Fewer than two points draw nothing.
 */
export function plotPoints(points: SeriesPoint[], byTime: boolean, gap: number): PlottedPoint[] {
	if (points.length < 2) return [];
	const placeByTime = byTime && points[points.length - 1].t > points[0].t;
	let run = 0;
	return points.map((point, index) => {
		if (index > 0 && byTime && gap > 0 && point.t - points[index - 1].t > gap) run++;
		return { ...point, x: placeByTime ? point.t : index, run };
	});
}

/** lonePoints are runs of a single point, which a line alone would not show. */
export function lonePoints(plotted: PlottedPoint[]): PlottedPoint[] {
	return plotted.filter(
		(point, index) => plotted[index - 1]?.run !== point.run && plotted[index + 1]?.run !== point.run
	);
}

/** isCandle says a point carries what a candle needs: an open, a high and a low. */
export function isCandle(point: SeriesPoint): point is SeriesPoint & { o: number; h: number; l: number } {
	return point.o != null && point.h != null && point.l != null;
}

/** candleTrend says a candle closed at or above its open, drawn hollow, or below it, drawn filled. */
export function candleTrend(point: SeriesPoint & { o: number }): 'rise' | 'fall' {
	return point.p >= point.o ? 'rise' : 'fall';
}

/** candleReading names a candle's values in order for a screen reader: "open 1, high 2, low 0.5, close 1.5". */
export function candleReading(point: SeriesPoint & { o: number; h: number; l: number }, format: (n: number) => string): string {
	return `open ${format(point.o)}, high ${format(point.h)}, low ${format(point.l)}, close ${format(point.p)}`;
}

/** hasCandles says every point can be drawn as a candle. */
export function hasCandles(points: SeriesPoint[]): boolean {
	return points.length > 0 && points.every(isCandle);
}

/**
 * valueBounds is the range of values to fit. It comes from the data rather
 * than anchoring at zero: these tokens move by fractions of a cent, and a zero
 * baseline would flatten every chart into a straight line. A baseline chart is
 * about zero, so zero is always in view. Candles fit their highs and lows. A
 * flat line keeps a nonzero span, with the line along the bottom.
 */
export function valueBounds(points: SeriesPoint[], baseline: boolean, candles = false): { min: number; span: number } | null {
	if (points.length === 0) return null;
	const values = candles ? points.flatMap((point) => (isCandle(point) ? [point.l, point.h] : [point.p])) : points.map((point) => point.p);
	if (baseline) values.push(0);
	const min = Math.min(...values);
	const max = Math.max(...values);
	return { min, span: max - min || Math.abs(max) || 1 };
}

/**
 * guideValues are a few round values across a range, for the horizontal
 * guides and their labels: at most `count`, at a step of 1, 2 or 5 times a
 * power of ten, and all inside the range.
 */
export function guideValues(min: number, span: number, count = 3): number[] {
	if (!(span > 0) || count < 1) return [];
	const rough = span / count;
	const magnitude = 10 ** Math.floor(Math.log10(rough));
	const step = [1, 2, 5, 10].map((unit) => unit * magnitude).find((candidate) => candidate >= rough) ?? 10 * magnitude;
	const values: number[] = [];
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
export function guideLabels(guides: { value: number; y: number }[], plotHeight: number, reserved = 0): number[] {
	const room = plotHeight - reserved;
	const fitting = guides.filter((guide) => guide.y <= room);
	if (plotHeight >= SHORT_PLOT_HEIGHT || fitting.length <= 1) return fitting.map((guide) => guide.value);
	const middle = room / 2;
	const nearest = fitting.reduce((best, guide) => (Math.abs(guide.y - middle) < Math.abs(best.y - middle) ? guide : best));
	return [nearest.value];
}

/**
 * timeTicks picks evenly spread points for the time axis: the first, the
 * last and up to `count` between, so the labels say where the range runs.
 */
export function timeTicks(plotted: PlottedPoint[], count = 2): PlottedPoint[] {
	if (plotted.length < 2) return plotted;
	const last = plotted.length - 1;
	const ticks = new Set<number>([0, last]);
	for (let i = 1; i <= count; i++) ticks.add(Math.round((last * i) / (count + 1)));
	return [...ticks].sort((a, b) => a - b).map((index) => plotted[index]);
}

/**
 * candleWidth is how wide a candle's body is, in pixels, for a plot this wide
 * holding this many candles, leaving a gap between neighbours and never so
 * thin it vanishes or so wide it looks like a bar chart.
 */
export function candleWidth(plotWidth: number, count: number): number {
	if (count < 1 || plotWidth <= 0) return 1;
	return Math.max(1, Math.min(14, Math.floor((plotWidth / count) * 0.65)));
}

/**
 * candleWidthByStep is how wide a candle's body is, in pixels, for candles
 * placed by time: from the smallest distance between two neighbours, so
 * candles close in time never overlap, never thinner than 1 or wider than
 * 14, as candleWidth. xs are the candles' x values in order, and the plot
 * is plotWidth pixels across from the first to the last.
 */
export function candleWidthByStep(plotWidth: number, xs: number[]): number {
	if (xs.length < 2 || plotWidth <= 0) return candleWidth(plotWidth, xs.length);
	const span = xs[xs.length - 1] - xs[0];
	let step = Infinity;
	for (let index = 1; index < xs.length; index++) {
		const between = xs[index] - xs[index - 1];
		if (between > 0 && between < step) step = between;
	}
	if (!(span > 0) || !Number.isFinite(step)) return candleWidth(plotWidth, xs.length);
	return Math.max(1, Math.min(14, Math.floor(((plotWidth * step) / span) * 0.65)));
}

/** Below this body width, in pixels, a candle is a line: too narrow to show hollow or filled. */
export const THIN_CANDLE_WIDTH = 3;

/** Below this body height, in pixels, a candle's body is a level line: it opened and closed at about the same price. */
export const FLAT_CANDLE_HEIGHT = 2;

/**
 * How a candle is drawn, in pixels. A thin one is a 1px line from high to
 * low with a 2px line over its body, since a body under THIN_CANDLE_WIDTH
 * cannot show hollow or filled, so colour alone tells rise from fall there
 * and the readout names it. A flat one, a doji, is a wick straight through
 * a level line across the body's width. Any other is a body box with a wick
 * above and below it, hollow when rising.
 */
export type CandleMarks =
	| { kind: 'thin'; x: number; high: number; low: number; top: number; bottom: number }
	| { kind: 'flat'; x: number; high: number; low: number; y: number; left: number; right: number }
	| { kind: 'body'; x: number; high: number; low: number; top: number; bottom: number; left: number; width: number };

/**
 * candleMarks places one candle: its centre x, the y of its high, low, and
 * body top and bottom, as the y scale gives them, and its body width.
 */
export function candleMarks(x: number, high: number, low: number, top: number, bottom: number, width: number): CandleMarks {
	const upper = Math.min(top, bottom);
	const lower = Math.max(top, bottom);
	if (width < THIN_CANDLE_WIDTH) return { kind: 'thin', x, high, low, top: upper, bottom: Math.max(lower, upper + 1) };
	if (lower - upper < FLAT_CANDLE_HEIGHT) {
		const y = (upper + lower) / 2;
		return { kind: 'flat', x, high: Math.min(high, y), low: Math.max(low, y), y, left: x - width / 2, right: x + width / 2 };
	}
	return { kind: 'body', x, high, low, top: upper, bottom: lower, left: x - width / 2, width };
}

/**
 * nearestIndex is the plotted point closest to x, in the chart's x units.
 * Points are in x order, so it bisects.
 */
export function nearestIndex(plotted: PlottedPoint[], x: number): number {
	let low = 0;
	let high = plotted.length - 1;
	while (high - low > 1) {
		const middle = (low + high) >> 1;
		if (plotted[middle].x <= x) low = middle;
		else high = middle;
	}
	return Math.abs(plotted[high].x - x) < Math.abs(plotted[low].x - x) ? high : low;
}

/**
 * carriedIndex is where an inspected point sits once new points arrive: the
 * index of the point with the same time, so a live tick leaves a keyboard or
 * touch inspection where it was. When that time is gone, as when another
 * range arrives, it is null and the inspection ends.
 */
export function carriedIndex(previous: SeriesPoint[], next: SeriesPoint[], index: number | null): number | null {
	if (index == null) return null;
	const time = previous[index]?.t;
	if (time == null) return null;
	if (next[index]?.t === time) return index;
	const found = next.findIndex((point) => point.t === time);
	return found === -1 ? null : found;
}

/**
 * inGap says x falls in a gap in the line: placed by time, its nearest point
 * is more than half a gap away, so no snapshot stands for that moment.
 */
export function inGap(point: PlottedPoint, x: number, byTime: boolean, gap: number): boolean {
	return byTime && gap > 0 && Math.abs(point.t - x) > gap / 2;
}

/**
 * inspectHint says how to inspect a chart while nothing is inspected. A
 * pointer hovers or drags, and a keyboard uses the arrow keys; a finger can
 * only drag, so a touch screen leaves hovering and keys out. noun is what a point is: "price", "value", "day". With
 * markers it also says how to see a trade.
 */
export function inspectHint(noun: string, withMarkers: boolean, touch: boolean): string {
	if (touch) {
		if (withMarkers) return `Tap or drag to see a ${noun}. Select a marker to see the trade.`;
		return `Tap or drag across the chart to see a ${noun}.`;
	}
	const verb = 'Hover, drag or use arrow keys';
	if (withMarkers) return `${verb} to see a ${noun}. Select a marker to see the trade.`;
	return `${verb} to see a ${noun}.`;
}

/** A marker's identity: what it shows and when. */
export function markerKey(marker: SeriesMarker): string {
	return `${marker.t}|${marker.title}`;
}

/**
 * markersInTime keeps the markers within the points' time range, each with how
 * far along it sits in time, from 0 to 1; SeriesChart places them between
 * their neighbouring points with xAtTime instead. Price history is cached and sampled, so it
 * usually ends a little before now; trades since then pin to the right edge
 * instead of vanishing. Markers that show the same thing at the same time
 * would sit on top of each other, so only the first is kept.
 */
export function markersInTime(
	points: SeriesPoint[],
	markers: SeriesMarker[],
	now = Date.now()
): (SeriesMarker & { along: number })[] {
	if (points.length < 2) return [];
	const firstTime = points[0].t;
	const lastTime = points[points.length - 1].t;
	if (lastTime <= firstTime) return [];
	const seen = new Set<string>();
	return markers
		.filter((marker) => marker.t >= firstTime && marker.t <= Math.max(lastTime, now))
		.filter((marker) => {
			const key = markerKey(marker);
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.map((marker) => ({ ...marker, along: Math.min(1, (marker.t - firstTime) / (lastTime - firstTime)) }));
}

/** How far outside a series' range a trade's price may be and still show, as a share of the range. */
export const MARKER_PRICE_TOLERANCE = 0.05;

/**
 * markersInRange keeps the markers priced close enough to the range bounds
 * spans to show: a trade can fill a little outside the sampled prices, as a
 * fill just under a 1-minute candle's low, but not far. Close is within
 * `tolerance` of the span below its low or above its high.
 */
export function markersInRange<Marker extends Pick<SeriesMarker, 'price'>>(
	markers: Marker[],
	bounds: { min: number; span: number } | null,
	tolerance = MARKER_PRICE_TOLERANCE
): Marker[] {
	if (!bounds) return [];
	const slack = bounds.span * tolerance;
	const low = bounds.min - slack;
	const high = bounds.min + bounds.span + slack;
	return markers.filter((marker) => marker.price >= low && marker.price <= high);
}

/**
 * boundsWithMarkers widens bounds to take in the markers' prices, so a trade
 * priced just outside the plotted range is fitted into the plot at its true
 * price, rather than drawn over the time axis or below the plot. Pass only
 * markersInRange, or one stray price would flatten the series.
 */
export function boundsWithMarkers(bounds: { min: number; span: number }, markers: Pick<SeriesMarker, 'price'>[]): { min: number; span: number } {
	let min = bounds.min;
	let max = bounds.min + bounds.span;
	for (const marker of markers) {
		if (marker.price < min) min = marker.price;
		if (marker.price > max) max = marker.price;
	}
	if (min === bounds.min && max === bounds.min + bounds.span) return bounds;
	return { min, span: max - min };
}

/**
 * withinPlotHeight says a marker at top pixels from the top of a plot this
 * tall is close enough to the plotted range to show: a trade can fill a
 * little outside the sampled prices, but not far. SeriesChart no longer uses
 * it, since it fits such trades into the plot with markersInRange and
 * boundsWithMarkers, but it stays exported for code that places its own.
 */
export function withinPlotHeight(top: number, plotHeight: number, tolerance = 0.05): boolean {
	return top >= -tolerance * plotHeight && top <= (1 + tolerance) * plotHeight;
}

/**
 * xAtTime is where a moment falls along the x axis, in the chart's x units
 * as plotPoints placed them. Placed by time, it is the moment itself;
 * placed evenly, it falls between the indexes of the points either side of
 * it, in proportion to time. A moment before the first point is the first
 * point's x, and after the last, as a trade since the last sample, the
 * last's.
 */
export function xAtTime(plotted: PlottedPoint[], t: number): number {
	if (plotted.length === 0) return 0;
	const last = plotted.length - 1;
	if (t <= plotted[0].t) return plotted[0].x;
	if (t >= plotted[last].t) return plotted[last].x;
	let low = 0;
	let high = last;
	while (high - low > 1) {
		const middle = (low + high) >> 1;
		if (plotted[middle].t <= t) low = middle;
		else high = middle;
	}
	const from = plotted[low];
	const to = plotted[high];
	const fraction = to.t > from.t ? (t - from.t) / (to.t - from.t) : 0;
	return from.x + (to.x - from.x) * fraction;
}

/**
 * seriesSummary describes a whole series in a sentence for screen readers,
 * as the chart's description: its span, how many points, where it started
 * and ended, and its high and low. Candles read their first open and last
 * close, and the highs and lows of the candles.
 */
export function seriesSummary(
	points: SeriesPoint[],
	candles: boolean,
	format: (n: number) => string,
	formatTime: (t: number, withYear: boolean) => string,
	withYear: boolean
): string {
	if (points.length < 2) return '';
	const first = points[0];
	const last = points[points.length - 1];
	const highs = candles ? points.map((point) => point.h ?? point.p) : points.map((point) => point.p);
	const lows = candles ? points.map((point) => point.l ?? point.p) : points.map((point) => point.p);
	const span = `From ${formatTime(first.t, withYear)} to ${formatTime(last.t, withYear)}`;
	const count = `${points.length} ${candles ? 'candles' : 'points'}`;
	const ends = candles ? `opened at ${format(first.o ?? first.p)}, closed at ${format(last.p)}` : `started at ${format(first.p)}, ended at ${format(last.p)}`;
	return `${span}: ${count}, ${ends}, high ${format(Math.max(...highs))}, low ${format(Math.min(...lows))}.`;
}
