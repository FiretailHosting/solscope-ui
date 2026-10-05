import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { stopBusyClick } from '../src/lib/busy-click.ts';
import Button from '../src/lib/components/ui/Button.svelte';
import SeriesChart from '../src/lib/components/ui/chart/SeriesChart.svelte';

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
	const live = readout.match(/<div class="readout-inspected[^"]*" aria-live="polite">([\s\S]*?)<\/div>/);
	assert.ok(live, 'the inspected part is live');
	assert.ok(!live[1].includes('Latest'), 'the hint is not in it');
	assert.ok(readout.includes('Latest $0.32'), 'the hint still shows');
});
