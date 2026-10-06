import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import RangePicker from '../src/lib/components/ui/RangePicker.svelte';
import { collapseQuery, optionForSelectValue, rangeButtonsFit, selectedOptionIndex } from '../src/lib/range-options.ts';

const ranges = [
	{ value: 1, label: '1D' },
	{ value: 7, label: '7D' },
	{ value: 30, label: '30D', disabled: true },
	{ value: 365, label: '1Y' }
];

test('the selected option is found by value, numbers included', () => {
	assert.equal(selectedOptionIndex(ranges, 7), 1);
	assert.equal(selectedOptionIndex(ranges, 365), 3);
	assert.equal(selectedOptionIndex(ranges, '7'), -1);
	assert.equal(selectedOptionIndex(ranges, undefined), -1);
});

test('a select value maps back to its option, never a disabled or missing one', () => {
	assert.equal(optionForSelectValue(ranges, '0'), ranges[0]);
	assert.equal(optionForSelectValue(ranges, '3'), ranges[3]);
	assert.equal(optionForSelectValue(ranges, '2'), undefined);
	assert.equal(optionForSelectValue(ranges, '9'), undefined);
	assert.equal(optionForSelectValue(ranges, ''), undefined);
	assert.equal(optionForSelectValue(ranges, '1.5'), undefined);
	assert.equal(optionForSelectValue(ranges, '-1'), undefined);
});

test('the picker collapses below its width, or never at 0', () => {
	assert.equal(collapseQuery(480), '(max-width: 479.98px)');
	assert.equal(collapseQuery(0), null);
	assert.equal(collapseQuery(-5), null);
	assert.equal(collapseQuery(Number.NaN), null);
});

test('the picker renders labelled buttons and a labelled select, with the rule that picks one', () => {
	const html = render(RangePicker, { props: { options: ranges, value: 7, label: 'Chart range' } }).body;
	assert.match(html, /role="group" aria-label="Chart range"/);
	assert.match(html, /<button[^>]*aria-pressed="true"[^>]*>\s*7D/);
	assert.match(html, /<select[^>]*aria-label="Chart range"/);
	assert.match(html, /<option value="1"[^>]*selected/);
	assert.match(html, /<option value="2" disabled/);
	assert.match(html, /@media \(max-width: 479\.98px\)/);
});

test('a value no option has selects nothing, and collapseBelow 0 leaves the buttons alone', () => {
	const html = render(RangePicker, { props: { options: ranges, value: 90, label: 'Chart range', collapseBelow: 0 } }).body;
	assert.ok(!/aria-pressed="true"/.test(html));
	assert.match(html, /<option value="" disabled[^>]*selected/);
	assert.ok(!html.includes('@media'));
});

test('the buttons fit when they share one row inside the space, and not once the row wraps or overflows', () => {
	const space = { left: 0, right: 300 };
	const row = (tops, width = 40) => tops.map((top, index) => ({ top, left: index * width, right: (index + 1) * width }));
	assert.equal(rangeButtonsFit(row([10, 10, 10]), space), true);
	assert.equal(rangeButtonsFit(row([10, 10.4, 10]), space), true, 'subpixel rounding is one row');
	assert.equal(rangeButtonsFit(row([10, 10, 38]), space), false, 'a wrapped button sits lower');
	assert.equal(rangeButtonsFit(row([10], 320), space), false, 'one button wider than the space');
	assert.equal(rangeButtonsFit(row([10, 10], 150.2), space), true, 'half a pixel of slack');
	assert.equal(rangeButtonsFit([], space), true);
});

test('the picker shows the select until it has measured the buttons, so they never overflow on first paint', () => {
	const html = render(RangePicker, { props: { options: ranges, value: 7, label: 'Chart range' } }).body;
	assert.ok(!html.includes('data-fit'));
});
