import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { candleReading, candleTrend, candleWidth, guideLabels, guideValues, SHORT_PLOT_HEIGHT, hasCandles, inGap, inspectHint, lonePoints, markerKey, markersInTime, nearestIndex, plotPoints, timeTicks, valueBounds, withinPlotHeight } from '../src/lib/chart/series.ts';
import { axisTime, chartDay, chartTime, spansYears } from '../src/lib/chart/dates.ts';

const HOUR = 3_600_000;
const start = Date.parse('2026-09-01T00:00:00Z');
const at = (hours, p) => ({ t: start + hours * HOUR, p });

test('fewer than two points draw nothing', () => {
	assert.deepEqual(plotPoints([], true, HOUR), []);
	assert.deepEqual(plotPoints([at(0, 1)], true, HOUR), []);
});

test('points sit evenly by index unless placed by time', () => {
	const points = [at(0, 1), at(1, 2), at(5, 3)];
	assert.deepEqual(plotPoints(points, false, 0).map((point) => point.x), [0, 1, 2]);
	assert.deepEqual(plotPoints(points, true, 0).map((point) => point.x), points.map((point) => point.t));
});

test('points at one time fall back to even spacing', () => {
	const points = [at(0, 1), at(0, 2)];
	assert.deepEqual(plotPoints(points, true, 0).map((point) => point.x), [0, 1]);
});

test('a gap wider than the limit starts a new run, only when placed by time', () => {
	const points = [at(0, 1), at(1, 2), at(5, 3), at(6, 4)];
	assert.deepEqual(plotPoints(points, true, 2 * HOUR).map((point) => point.run), [0, 0, 1, 1]);
	assert.deepEqual(plotPoints(points, false, 2 * HOUR).map((point) => point.run), [0, 0, 0, 0]);
});

test('a run of one point is lone', () => {
	const plotted = plotPoints([at(0, 1), at(1, 2), at(5, 3), at(10, 4), at(11, 5)], true, 2 * HOUR);
	assert.deepEqual(lonePoints(plotted).map((point) => point.p), [3]);
});

test('bounds fit the data, and take in zero with a baseline', () => {
	assert.deepEqual(valueBounds([at(0, 2), at(1, 5)], false), { min: 2, span: 3 });
	assert.deepEqual(valueBounds([at(0, 2), at(1, 5)], true), { min: 0, span: 5 });
	assert.deepEqual(valueBounds([at(0, -2), at(1, -5)], true), { min: -5, span: 5 });
	assert.equal(valueBounds([], false), null);
});

test('candle bounds fit the highs and lows', () => {
	const candles = [{ ...at(0, 2), o: 1, h: 6, l: 0.5 }, { ...at(1, 3), o: 2, h: 4, l: 1 }];
	assert.deepEqual(valueBounds(candles, false, true), { min: 0.5, span: 5.5 });
	assert.ok(hasCandles(candles));
	assert.ok(!hasCandles([at(0, 1)]));
	assert.ok(!hasCandles([]));
});

test('a flat line keeps a nonzero span', () => {
	assert.deepEqual(valueBounds([at(0, 3), at(1, 3)], false), { min: 3, span: 3 });
	assert.deepEqual(valueBounds([at(0, 0), at(1, 0)], false), { min: 0, span: 1 });
});

test('guides fall on round values inside the range', () => {
	assert.deepEqual(guideValues(0.0042, 0.0013), [0.0045, 0.005, 0.0055]);
	assert.deepEqual(guideValues(9000, 550), [9000, 9200, 9400]);
	assert.deepEqual(guideValues(-90, 270), [0, 100]);
	assert.deepEqual(guideValues(1, 0), []);
});

test('time ticks are the ends and evenly spread points between', () => {
	const plotted = plotPoints(Array.from({ length: 11 }, (_, i) => at(i, i)), true, 0);
	assert.deepEqual(timeTicks(plotted, 2).map((point) => point.p), [0, 3, 7, 10]);
	assert.deepEqual(timeTicks(plotted.slice(0, 2), 2).map((point) => point.p), [0, 1]);
});

test('candles stay between one and fourteen pixels wide, with a gap', () => {
	assert.equal(candleWidth(400, 10), 14);
	assert.equal(candleWidth(400, 100), 2);
	assert.equal(candleWidth(400, 1000), 1);
	assert.equal(candleWidth(0, 10), 1);
});

test('the nearest point is found on either side, and at the ends', () => {
	const plotted = plotPoints([at(0, 1), at(2, 2), at(4, 3)], true, 0);
	assert.equal(nearestIndex(plotted, start - HOUR), 0);
	assert.equal(nearestIndex(plotted, start + 0.9 * HOUR), 0);
	assert.equal(nearestIndex(plotted, start + 1.1 * HOUR), 1);
	assert.equal(nearestIndex(plotted, start + 9 * HOUR), 2);
});

test('a pointer more than half a gap from its nearest point is in the gap', () => {
	const [point] = plotPoints([at(0, 1), at(10, 2)], true, 4 * HOUR);
	assert.ok(!inGap(point, start + HOUR, true, 4 * HOUR));
	assert.ok(inGap(point, start + 3 * HOUR, true, 4 * HOUR));
	assert.ok(!inGap(point, start + 3 * HOUR, false, 4 * HOUR));
});

test('markers a little outside the plot still show, far ones do not', () => {
	assert.ok(withinPlotHeight(-4, 100));
	assert.ok(withinPlotHeight(104, 100));
	assert.ok(!withinPlotHeight(-6, 100));
	assert.ok(!withinPlotHeight(106, 100));
});

test('chart times are short, with the year only across years', () => {
	const t = Date.parse('2026-09-25T05:21:00');
	assert.equal(chartDay(t, false), 'Sep 25');
	assert.equal(chartDay(t, true), 'Sep 25, 2026');
	assert.match(chartTime(t, false), /^Sep 25, 5:21/);
	assert.ok(!spansYears([at(0, 1), at(24, 2)]));
	assert.ok(spansYears([{ t: Date.parse('2025-12-31T12:00:00Z'), p: 1 }, { t: Date.parse('2026-01-01T12:00:00Z'), p: 1 }]));
	assert.match(axisTime(t, 12 * HOUR, false), /5:21/);
	assert.match(axisTime(t, 2 * 24 * HOUR, false), /^Sep 25, 5/);
	assert.equal(axisTime(t, 7 * 24 * HOUR, false), 'Sep 25');
	assert.equal(axisTime(t, 400 * 24 * HOUR, true), 'Sep 2026');
});

test('markers that show the same thing at the same time are kept once', () => {
	const points = [at(0, 1), at(10, 2)];
	const marker = { t: start + 5 * HOUR, price: 1.5, side: 'buy', title: 'You bought' };
	assert.equal(markersInTime(points, [marker, { ...marker }]).length, 1);
	assert.equal(markersInTime(points, [marker, { ...marker, title: 'Bot bought' }]).length, 2);
	assert.equal(markerKey(marker), `${marker.t}|You bought`);
});

test('markers outside the range are left out, and recent trades pin to the right edge', () => {
	const points = [at(0, 1), at(10, 2)];
	const now = start + 12 * HOUR;
	const markers = [
		{ t: start - HOUR, price: 1, side: 'buy', title: 'before' },
		{ t: start + 5 * HOUR, price: 1, side: 'buy', title: 'middle' },
		{ t: start + 11 * HOUR, price: 1, side: 'sell', title: 'after the last point' },
		{ t: start + 13 * HOUR, price: 1, side: 'sell', title: 'in the future' }
	];
	assert.deepEqual(markersInTime(points, markers, now).map((marker) => [marker.title, marker.along]), [['middle', 0.5], ['after the last point', 1]]);
});

test('no markers without a time range', () => {
	assert.deepEqual(markersInTime([at(0, 1)], [{ t: start, price: 1, side: 'buy', title: 'x' }]), []);
	assert.deepEqual(markersInTime([at(0, 1), at(0, 2)], [{ t: start, price: 1, side: 'buy', title: 'x' }]), []);
});

test('the hint leaves hovering out on a touch screen, and says how to see a trade with markers', () => {
	assert.equal(inspectHint('price', false, false), 'Hover or drag across the chart to see a price.');
	assert.equal(inspectHint('price', false, true), 'Tap or drag across the chart to see a price.');
	assert.equal(inspectHint('value', true, true), 'Tap or drag to see a value. Select a dot to see the trade.');
});

test('a rising candle is hollow and a falling one filled', () => {
	assert.equal(candleTrend({ t: start, p: 2, o: 1 }), 'rise');
	assert.equal(candleTrend({ t: start, p: 1, o: 1 }), 'rise');
	assert.equal(candleTrend({ t: start, p: 1, o: 2 }), 'fall');
});

test('a candle reads open, high, low and close, each named', () => {
	assert.equal(candleReading({ t: start, p: 1.5, o: 1, h: 2, l: 0.5 }, (n) => `$${n}`), 'open $1, high $2, low $0.5, close $1.5');
});

test('guide labels keep out of the time axis row', () => {
	const guides = [{ value: 3, y: 40 }, { value: 2, y: 120 }, { value: 1, y: 190 }];
	assert.deepEqual(guideLabels(guides, 200, 16), [3, 2]);
	assert.deepEqual(guideLabels(guides, 200, 0), [3, 2, 1]);
});

test('a short chart keeps one guide label at most, the one nearest the middle', () => {
	assert.ok(SHORT_PLOT_HEIGHT === 150);
	const guides = [{ value: 3, y: 10 }, { value: 2, y: 45 }, { value: 1, y: 85 }];
	assert.deepEqual(guideLabels(guides, 96, 16), [2]);
	assert.deepEqual(guideLabels([{ value: 1, y: 90 }], 96, 16), []);
	assert.deepEqual(guideLabels([], 96, 16), []);
	assert.deepEqual(guideLabels(guides, 149, 0), [1]);
	assert.deepEqual(guideLabels(guides, 150, 0), [3, 2, 1]);
});
