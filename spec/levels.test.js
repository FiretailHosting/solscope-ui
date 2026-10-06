import { test } from 'bun:test';
import assert from 'node:assert/strict';
import {
	boundsWithLevels,
	layoutLevelTags,
	LEVEL_PRICE_TOLERANCE,
	levelGroupText,
	levelPin,
	levelsInRange,
	levelsSummary,
	levelText,
	placeLevels,
	stackLabels
} from '../src/lib/chart/levels.ts';
import { boundsWithMarkers, markersInRange, SERIES_CHART_MIN_HEIGHT, seriesMinHeight, seriesPlotStyle } from '../src/lib/chart/series.ts';

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

// A tag wanted at y for a level of this value, on the plot or pinned.
const want = (wanted, value, pinned = null) => ({ wanted, value, pinned });

/** assertLayout checks what every layout must keep: each level shown once, tags apart, in order and on the plot, clear of the chips. */
function assertLayout(levels, layout, height, top, bottom) {
	const grouped = [...layout.above, ...layout.below];
	levels.forEach((_, index) => {
		const tagged = layout.tags[index] != null;
		assert.equal(tagged, !grouped.includes(index), `level ${index} is tagged or grouped, not both or neither`);
	});
	assert.equal(new Set(grouped).size, grouped.length);
	const low = top + (layout.aboveChip == null ? 0 : height) + height / 2;
	const high = bottom - (layout.belowChip == null ? 0 : height) - height / 2;
	const tagged = levels.map((level, index) => ({ level, y: layout.tags[index] })).filter((entry) => entry.y != null);
	for (const entry of tagged) assert.ok(entry.y >= low - 1e-9 && entry.y <= high + 1e-9, `tag at ${entry.y} is between ${low} and ${high}`);
	tagged.sort((a, b) => a.level.wanted - b.level.wanted);
	for (let i = 1; i < tagged.length; i++) assert.ok(tagged[i].y - tagged[i - 1].y >= height - 1e-9, 'tags never cover each other and keep their order');
}

test('a plot is never shorter than its least height, nor taller than the height it asked for', () => {
	assert.equal(SERIES_CHART_MIN_HEIGHT, 220);
	assert.equal(seriesMinHeight(260), 220);
	assert.equal(seriesMinHeight(96), 96);
});

test('a plot is as wide as its size container, with a height that follows that width and never the other way', () => {
	assert.equal(seriesPlotStyle(260), 'width: 100%; height: max(220px, calc(100cqw * 260 / 800))');
	assert.equal(seriesPlotStyle(96), 'width: 100%; height: max(96px, calc(100cqw * 96 / 800))');
	assert.equal(seriesPlotStyle(260, { minHeight: 180 }), 'width: 100%; height: max(180px, calc(100cqw * 260 / 800))');
	assert.equal(seriesPlotStyle(220, { fixed: true }), 'height: 220px');
	assert.ok(!seriesPlotStyle(260).includes('aspect-ratio'), 'an aspect ratio with a least height would give the plot a least width');
});

test('levels pinned beyond an edge gather into one chip per edge rather than a tag each', () => {
	// As BONK's 7D range in a 220px plot with its time axis: six far below, two far above, one on the plot.
	const levels = [
		want(204, 3.45, 'below'),
		want(204, 3.26, 'below'),
		want(0, 4.53, 'above'),
		want(204, 2.97, 'below'),
		want(100, 3.8),
		want(204, 1.48, 'below'),
		want(0, 4.82, 'above'),
		want(204, 2.89, 'below'),
		want(204, 3.05, 'below')
	];
	const layout = layoutLevelTags(levels, 18, 0, 204);
	assert.deepEqual(layout.above, [6, 2], 'highest first');
	assert.deepEqual(layout.below, [0, 1, 8, 3, 7, 5]);
	assert.equal(layout.aboveChip, 9);
	assert.equal(layout.belowChip, 195);
	assert.equal(layout.tags[4], 100, 'the level on the plot keeps its tag where it wants it');
	assertLayout(levels, layout, 18, 0, 204);
});

test('with nothing pinned and room for every tag, there are no chips', () => {
	const levels = [want(40, 3), want(42, 2.9), want(150, 1)];
	const layout = layoutLevelTags(levels, 18, 0, 200);
	assert.deepEqual([layout.above, layout.below, layout.aboveChip, layout.belowChip], [[], [], null, null]);
	assert.deepEqual(layout.tags, [40, 58, 150]);
	assert.deepEqual(layoutLevelTags([], 18, 0, 200), { tags: [], above: [], below: [], aboveChip: null, belowChip: null });
});

test('a pinned level keeps the tags on the plot clear of its chip', () => {
	const levels = [want(0, 10, 'above'), want(2, 5)];
	const layout = layoutLevelTags(levels, 18, 0, 200);
	assert.equal(layout.aboveChip, 9);
	assert.equal(layout.tags[1], 27, 'pushed down under the chip');
});

test('tags that cannot all fit gather the outermost into an edge chip rather than leaving the plot', () => {
	// Twelve levels crowded at the bottom of a 96px plot: room for four tags and a chip.
	const levels = Array.from({ length: 12 }, (_, index) => want(60 + index * 2, 100 - index));
	const layout = layoutLevelTags(levels, 18, 0, 96);
	assertLayout(levels, layout, 18, 0, 96);
	assert.equal(layout.above.length, 0, 'the crowded edge takes the overflow');
	assert.equal(layout.belowChip, 87);
	assert.deepEqual(layout.below, [4, 5, 6, 7, 8, 9, 10, 11], 'the lowest ones, highest first');
	assert.deepEqual(layout.tags.slice(0, 4), [15, 33, 51, 69], 'pushed up from the chip');
});

test('overflow joins the edge whose chip is already there before opening another', () => {
	const levels = [want(0, 50, 'above'), ...Array.from({ length: 8 }, (_, index) => want(150 + index, 10 - index))];
	const layout = layoutLevelTags(levels, 18, 0, 120);
	assertLayout(levels, layout, 18, 0, 120);
	assert.equal(layout.belowChip, null);
	assert.equal(layout.above[0], 0, 'the pinned level stays first, highest');
	assert.equal(layout.tags.filter((y) => y != null).length, 5);
});

test('many levels on a tall plot both ways stay on it, every one tagged or grouped', () => {
	for (const count of [1, 5, 11, 12, 20, 40]) {
		const levels = Array.from({ length: count }, (_, index) => want((index * 197) % 210, 1000 - index, index % 7 === 0 ? 'below' : index % 5 === 0 ? 'above' : null));
		for (const bottom of [96, 204, 400]) assertLayout(levels, layoutLevelTags(levels, 18, 0, bottom), 18, 0, bottom);
	}
});

test('an edge group says its count and which way in words', () => {
	assert.deepEqual(levelGroupText('below', [{ pinned: 'below' }, { pinned: 'below' }]), {
		chip: '2 below',
		name: '2 below the chart',
		heading: '2 levels below the chart'
	});
	assert.deepEqual(levelGroupText('above', [{ pinned: 'above' }]), { chip: '1 above', name: '1 above the chart', heading: '1 level above the chart' });
	assert.deepEqual(levelGroupText('above', [{ pinned: 'above' }, { pinned: null }, { pinned: null }]), {
		chip: '3 more',
		name: '3 more levels at the top',
		heading: '3 more levels at the top'
	});
	assert.equal(levelGroupText('below', [{ pinned: null }]).name, '1 more level at the bottom');
});
