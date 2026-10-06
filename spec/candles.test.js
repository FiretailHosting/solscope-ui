import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { candleMarks, candleWidth, candleWidthByStep, FLAT_CANDLE_HEIGHT, THIN_CANDLE_WIDTH } from '../src/lib/chart/series.ts';

test('a candle with room is a body box with a wick above and below it', () => {
	assert.deepEqual(candleMarks(50, 10, 90, 30, 60, 8), { kind: 'body', x: 50, high: 10, low: 90, top: 30, bottom: 60, left: 46, width: 8 });
	// Top and bottom in either order.
	assert.deepEqual(candleMarks(50, 10, 90, 60, 30, 8).top, 30);
});

test('a candle too narrow for hollow or filled is a line with a thicker body line, never a hole', () => {
	assert.equal(THIN_CANDLE_WIDTH, 3);
	for (const width of [1, 2]) {
		const marks = candleMarks(50, 10, 90, 30, 60, width);
		assert.equal(marks.kind, 'thin');
		assert.deepEqual([marks.high, marks.low, marks.top, marks.bottom], [10, 90, 30, 60]);
	}
	// A flat body still gets a pixel.
	const flat = candleMarks(50, 10, 90, 40, 40, 1);
	assert.equal(flat.bottom - flat.top, 1);
	assert.equal(candleMarks(50, 10, 90, 30, 60, 3).kind, 'body');
});

test('a doji is a level line across the body width with the wick straight through', () => {
	assert.equal(FLAT_CANDLE_HEIGHT, 2);
	assert.deepEqual(candleMarks(50, 10, 90, 40, 41, 8), { kind: 'flat', x: 50, high: 10, low: 90, y: 40.5, left: 46, right: 54 });
	// With no wick, the line still spans the body.
	const bare = candleMarks(50, 40, 40, 40, 40, 6);
	assert.deepEqual([bare.kind, bare.high, bare.low, bare.left, bare.right], ['flat', 40, 40, 47, 53]);
	assert.equal(candleMarks(50, 10, 90, 40, 42, 8).kind, 'body');
});

test('candles placed by time size to the closest two, so a burst never overlaps', () => {
	// Evenly spread, the same as by count give or take the ends.
	assert.equal(candleWidthByStep(400, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 14);
	// A burst of candles 1 apart in a span of 100: 4px apart, so 2px wide.
	assert.equal(candleWidthByStep(400, [0, 1, 2, 50, 100]), 2);
	assert.ok(candleWidthByStep(400, [0, 1, 2, 50, 100]) < candleWidth(400, 5), 'narrower than by count');
	// Never under 1, never over 14, and repeated times are skipped.
	assert.equal(candleWidthByStep(400, [0, 0.001, 1000]), 1);
	assert.equal(candleWidthByStep(4000, [0, 1, 1, 2]), 14);
	// Too few to tell, or one time, falls back to the count.
	assert.equal(candleWidthByStep(400, [5]), candleWidth(400, 1));
	assert.equal(candleWidthByStep(400, [5, 5]), candleWidth(400, 2));
});
