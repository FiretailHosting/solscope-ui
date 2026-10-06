import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { boundsWithLevels, LEVEL_PRICE_TOLERANCE, levelPin, levelsInRange, levelsSummary, levelText, placeLevels, stackLabels } from '../src/lib/chart/levels.ts';
import { boundsWithMarkers, markersInRange } from '../src/lib/chart/series.ts';

const bounds = { min: 10, span: 10 };
const level = (key, value, extra = {}) => ({ key, value, label: key, ...extra });

test('a level a little outside the prices widens the view, within the tolerance of the range', () => {
	assert.equal(LEVEL_PRICE_TOLERANCE, 0.1);
	const near = [level('tp', 20.9), level('buy', 9.2)];
	const far = [level('far-up', 21.1), level('far-down', 8.9), level('nan', NaN)];
	assert.deepEqual(levelsInRange([...near, ...far], bounds), near);
	assert.deepEqual(boundsWithLevels(bounds, near), { min: 9.2, span: 20.9 - 9.2 });
	assert.deepEqual(levelsInRange(near, null), []);
	assert.deepEqual(levelsInRange([level('wide', 25)], bounds, 0.5).length, 1);
});

test('a level inside the prices leaves the bounds as they are', () => {
	assert.equal(boundsWithLevels(bounds, [level('in', 15)]), bounds);
	assert.equal(boundsWithLevels(bounds, []), bounds);
});

test('levels and trades widen the view together, each by its own tolerance', () => {
	const markers = markersInRange([{ price: 20.4 }], bounds);
	const fitted = boundsWithLevels(boundsWithMarkers(bounds, markers), levelsInRange([level('sl', 9.5)], bounds));
	assert.deepEqual(fitted, { min: 9.5, span: 20.4 - 9.5 });
});

test('a far level pins to the edge it lies beyond, so it never flattens the series', () => {
	const placed = placeLevels([level('tp', 50, { tone: 'up' }), level('sl', 1, { tone: 'down', dashed: true }), level('in', 12)], bounds);
	assert.deepEqual(
		placed.map((entry) => [entry.key, entry.pinned]),
		[['tp', 'above'], ['sl', 'below'], ['in', null]]
	);
	assert.equal(placed[1].dashed, true, 'it keeps the rest of the level');
	assert.equal(levelPin(20, bounds), null, 'the edges are on the plot');
	assert.equal(levelPin(10, bounds), null);
});

test('a repeated key or a value that is not a number draws nothing extra', () => {
	const placed = placeLevels([level('a', 12), level('a', 13), level('b', Infinity)], bounds);
	assert.deepEqual(placed.map((entry) => entry.value), [12]);
});

test('a level is read as its label at its value, and where it lies when pinned', () => {
	const format = (n) => `$${n.toFixed(4)}`;
	assert.equal(levelText({ label: 'Take profit', value: 0.0123 }, format), 'Take profit at $0.0123');
	assert.equal(levelText({ label: 'Take profit', value: 0.05, pinned: 'above' }, format), 'Take profit at $0.0500, above the chart');
	assert.equal(levelText({ label: 'Stop loss', value: 0.001, pinned: 'below' }, format), 'Stop loss at $0.0010, below the chart');
	assert.equal(
		levelsSummary([{ label: 'Take profit', value: 0.0123, pinned: null }, { label: 'Stop loss', value: 0.01, pinned: 'below' }], format),
		'Take profit at $0.0123. Stop loss at $0.0100, below the chart.'
	);
	assert.equal(levelsSummary([], format), '');
});

test('labels move apart so none covers another, keeping their order and staying on the plot', () => {
	// Two labels wanting nearly the same spot: the lower one moves down.
	assert.deepEqual(stackLabels([50, 52], 18, 0, 200), [50, 68]);
	// The result is in the order given, whichever is higher.
	assert.deepEqual(stackLabels([52, 50], 18, 0, 200), [68, 50]);
	// Labels past the bottom push up from it.
	assert.deepEqual(stackLabels([195, 200], 18, 0, 200), [173, 191]);
	// And never above the top.
	assert.deepEqual(stackLabels([-20, 100], 18, 0, 200), [9, 100]);
	assert.deepEqual(stackLabels([], 18, 0, 200), []);
});
