import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { stopBusyClick } from '../src/lib/busy-click.ts';
import Button from '../src/lib/components/ui/Button.svelte';
import SeriesChart from '../src/lib/components/ui/chart/SeriesChart.svelte';
import SeriesHintRow from '../src/lib/components/ui/chart/SeriesHintRow.svelte';

const HOUR = 3_600_000;
const start = Date.parse('2026-09-01T00:00:00Z');
const points = [0, 1, 2].map((hours) => ({ t: start + hours * HOUR, p: 0.1234 + hours / 10 }));

/** The opening tag of the first element matching tag in rendered HTML. */
function openingTag(html, tag) {
	return html.match(new RegExp(`<${tag}\\b[^>]*>`))?.[0] ?? '';
}

test('a loading button stays enabled, so it keeps focus, and says it is busy', () => {
	const button = openingTag(render(Button, { props: { loading: true, type: 'submit' } }).body, 'button');
	assert.ok(!/\sdisabled/.test(button), button);
	assert.match(button, /aria-disabled="true"/);
	assert.match(button, /aria-busy="true"/);
});

test('an explicitly disabled button is natively disabled, loading or not', () => {
	assert.match(openingTag(render(Button, { props: { disabled: true } }).body, 'button'), /\sdisabled/);
	assert.match(openingTag(render(Button, { props: { disabled: true, loading: true } }).body, 'button'), /\sdisabled/);
});

test('an idle button keeps the aria-disabled it was given', () => {
	const idle = openingTag(render(Button, { props: {} }).body, 'button');
	assert.ok(!/aria-disabled|aria-busy/.test(idle), idle);
	assert.match(openingTag(render(Button, { props: { 'aria-disabled': 'true' } }).body, 'button'), /aria-disabled="true"/);
});

test('a press on a busy control is swallowed, so a form is not submitted twice', () => {
	const calls = [];
	const event = { preventDefault: () => calls.push('preventDefault'), stopImmediatePropagation: () => calls.push('stop') };
	assert.equal(stopBusyClick(event, true), true);
	assert.deepEqual(calls, ['preventDefault', 'stop']);
	calls.length = 0;
	assert.equal(stopBusyClick(event, false), false);
	assert.deepEqual(calls, []);
});

test('the hint under a chart is outside the live region', () => {
	const html = render(SeriesChart, { props: { points, hint: 'Latest $0.32' } }).body;
	const readout = html.slice(html.lastIndexOf('<div', html.indexOf('class="sui-series-readout')));
	assert.ok(!/aria-live/.test(openingTag(readout, 'div')), 'the readout itself is not live');
	// The inspected part is a live region, quiet until a pick changes.
	const live = readout.match(/<div class="readout-inspected[^"]*" aria-live="off">([\s\S]*?)<\/div>/);
	assert.ok(live, 'the inspected part is live');
	assert.ok(!live[1].includes('Latest'), 'the hint is not in it');
	assert.ok(readout.includes('Latest $0.32'), 'the hint still shows');
});

test('the canvas chart keeps a DOM layer: a labelled slider, a described picture and one live region', () => {
	const html = render(SeriesChart, { props: { points, label: 'BONK price history', format: (n) => `$${n.toFixed(2)}` } }).body;
	const slider = openingTag(html, 'input');
	assert.match(slider, /type="range"/);
	assert.match(slider, /aria-label="BONK price history"/);
	assert.match(slider, /max="2"/);
	assert.match(slider, /aria-valuetext="\$0\.32, /, 'the slider reads the latest point before anything is inspected');
	assert.ok(!/aria-describedby/.test(slider), 'only the picture carries the summary, so it is read once');
	const picture = html.match(/<div[^>]*role="img"[^>]*>/)?.[0] ?? '';
	assert.match(picture, /aria-label="BONK price history"/);
	const describedBy = picture.match(/aria-describedby="([^"]+)"/)?.[1];
	assert.ok(describedBy, 'the picture has a description');
	// Visually hidden, not hidden, so browse mode reads it in order too.
	assert.match(html, new RegExp(`<span id="${describedBy}" class="visually-hidden[^"]*"[^>]*>From [^<]*3 points, started at \\$0\\.12, ended at \\$0\\.32`));
	assert.equal(html.match(/aria-live=/g)?.length, 1, 'only the inspected readout is a live region');
	assert.ok(!/aria-live="polite"/.test(html), 'and it says nothing before a pick');
});

test('a summary given replaces the built-in one', () => {
	const html = render(SeriesChart, { props: { points, summary: 'Up 160% this week.' } }).body;
	assert.match(html, /visually-hidden[^>]*>Up 160% this week\.<\/span>/);
});

test('fewer than two points show the empty text, with no chart', () => {
	const html = render(SeriesChart, { props: { points: points.slice(0, 1), empty: 'Nothing yet.' } }).body;
	assert.match(html, /Nothing yet\./);
	assert.ok(!html.includes('type="range"'));
});

test('the chart has no attribution row: the readout follows the plot', () => {
	const html = render(SeriesChart, { props: { points } }).body;
	assert.ok(!/tradingview|attribution/i.test(html), 'nothing credits a chart library');
	const after = html.slice(html.indexOf('class="plot'));
	assert.ok(after.includes('class="host'), 'the plot comes first');
	assert.ok(!/<a\b/.test(html), 'no link in or under the chart');
});

test('levels are read after the summary, a pinned one saying where it lies', () => {
	const format = (n) => `$${n.toFixed(2)}`;
	const levels = [
		{ key: 'tp', value: 0.33, label: 'Take profit', tone: 'up' },
		{ key: 'sl', value: -5, label: 'Stop loss', tone: 'down' }
	];
	const html = render(SeriesChart, { props: { points, levels, format } }).body;
	assert.match(html, /visually-hidden[^>]*>From [^<]*low \$0\.12\. Take profit at \$0\.33\. Stop loss at \$-5\.00, below the chart\.<\/span>/);
	const custom = render(SeriesChart, { props: { points, levels: levels.slice(0, 1), format, summary: 'Up this week.' } }).body;
	assert.match(custom, /visually-hidden[^>]*>Up this week\. Take profit at \$0\.33\.<\/span>/);
});

const MARKER_HINT = 'Select a marker to see the trade.';

/** The readout row and the part of it that only holds its size, unseen. */
function hintRow(html) {
	const row = html.slice(html.lastIndexOf('<div', html.indexOf('class="sui-series-readout')));
	const start = row.indexOf('<div class="held');
	// The held part ends where its opening div closes.
	let end = start;
	for (let depth = 0; start !== -1; ) {
		const tag = row.slice(end).match(/<\/?div\b/);
		end += tag.index + tag[0].length;
		depth += tag[0] === '<div' ? 1 : -1;
		if (depth === 0) break;
	}
	const held = start === -1 ? '' : row.slice(start, row.indexOf('>', end) + 1);
	// Without hydration markers, so a stand-in and a chart compare.
	const text = (html) => html.replace(/<!--[\s\S]*?-->/g, '').trim();
	return { row, held: text(held), shown: text(row.replace(held, '')) };
}

test('a chart where markers may show holds the marker hint unseen and does not say it', () => {
	const { held, shown } = hintRow(render(SeriesChart, { props: { points, markersPossible: true } }).body);
	assert.ok(held.includes(MARKER_HINT), 'the marker hint holds the row');
	assert.ok(!shown.includes(MARKER_HINT), 'with no markers it is not shown or read');
	assert.ok(shown.includes('to see a price.'), 'the plain hint shows');
});

test('without markersPossible the row holds the hint it shows', () => {
	const { held } = hintRow(render(SeriesChart, { props: { points } }).body);
	assert.ok(held.includes('to see a price.'));
	assert.ok(!held.includes(MARKER_HINT));
});

test('a chart with markers shows the marker hint and holds it', () => {
	const markers = [{ t: points[1].t, price: points[1].p, side: 'buy', title: 'Bought' }];
	const { held, shown } = hintRow(render(SeriesChart, { props: { points, markers } }).body);
	assert.ok(held.includes(MARKER_HINT));
	assert.ok(shown.includes(MARKER_HINT));
});

test('a hint row stand-in is hidden from screen readers and holds the same hint as its chart', () => {
	const standIn = hintRow(render(SeriesHintRow, { props: { markersPossible: true } }).body);
	assert.match(openingTag(standIn.row, 'div'), /aria-hidden="true"/);
	const chart = hintRow(render(SeriesChart, { props: { points, markersPossible: true } }).body);
	assert.equal(standIn.held, chart.held);
	assert.ok(!/aria-hidden/.test(openingTag(chart.row, 'div')), 'the chart\'s own row is read');
});

test('a stand-in holds the chart\'s own hint when it has one', () => {
	const { row, held } = hintRow(render(SeriesHintRow, { props: { noun: 'value', hint: 'Latest $1' } }).body);
	assert.match(openingTag(row, 'div'), /aria-hidden="true"/);
	assert.ok(held.includes('Latest $1'));
});

test('a hint of your own is held beside the marker hint when markers may show', () => {
	const { held, shown } = hintRow(render(SeriesChart, { props: { points, hint: 'No candle data.', markersPossible: true } }).body);
	assert.ok(held.includes('No candle data.') && held.includes(MARKER_HINT), 'both hold the row');
	assert.ok(shown.includes('No candle data.') && !shown.includes(MARKER_HINT), 'only the hint of your own shows');
	const plain = hintRow(render(SeriesChart, { props: { points, hint: 'No candle data.' } }).body);
	assert.ok(!plain.held.includes(MARKER_HINT), 'without markersPossible only that hint is held');
});
