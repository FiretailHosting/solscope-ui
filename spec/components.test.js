import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { stopBusyClick } from '../src/lib/busy-click.ts';
import { TRADINGVIEW_CREDIT, TRADINGVIEW_NOTICE, TRADINGVIEW_URL } from '../src/lib/chart/attribution.ts';
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

test('the canvas chart keeps a DOM layer: a labelled slider, a described picture and one live region', () => {
	const html = render(SeriesChart, { props: { points, label: 'BONK price history', format: (n) => `$${n.toFixed(2)}` } }).body;
	const slider = openingTag(html, 'input');
	assert.match(slider, /type="range"/);
	assert.match(slider, /aria-label="BONK price history"/);
	assert.match(slider, /max="2"/);
	assert.match(slider, /aria-valuetext="\$0\.32, /, 'the slider reads the latest point before anything is inspected');
	const picture = html.match(/<div[^>]*role="img"[^>]*>/)?.[0] ?? '';
	assert.match(picture, /aria-label="BONK price history"/);
	const describedBy = picture.match(/aria-describedby="([^"]+)"/)?.[1];
	assert.ok(describedBy, 'the picture has a description');
	assert.match(html, new RegExp(`<span id="${describedBy}" hidden[^>]*>From [^<]*3 points, started at \\$0\\.12, ended at \\$0\\.32`));
	assert.equal(html.match(/aria-live="polite"/g)?.length, 1, 'only the inspected readout is live');
});

test('a summary given replaces the built-in one', () => {
	const html = render(SeriesChart, { props: { points, summary: 'Up 160% this week.' } }).body;
	assert.match(html, /hidden[^>]*>Up 160% this week\.<\/span>/);
});

test('fewer than two points show the empty text, with no chart', () => {
	const html = render(SeriesChart, { props: { points: points.slice(0, 1), empty: 'Nothing yet.' } }).body;
	assert.match(html, /Nothing yet\./);
	assert.ok(!html.includes('type="range"'));
});

test('TradingView is credited in its own row under the plot, rendered with the page, linking where its license asks', () => {
	const html = render(SeriesChart, { props: { points } }).body;
	const credit = html.match(/<p class="sui-series-attribution[^"]*">\s*(<a\b[^>]*>)([^<]*)<\/a>/);
	assert.ok(credit, 'the credit renders on the server, so nothing moves when the chart loads');
	const [, link, text] = credit;
	assert.equal(text, TRADINGVIEW_CREDIT);
	assert.ok(link.includes(`href="${TRADINGVIEW_URL}"`), link);
	assert.match(link, /target="_blank"/);
	assert.match(link, /rel="noopener noreferrer"/);
	assert.match(link, /aria-label="Charts by TradingView \(opens in a new tab\)"/);
	assert.ok(link.includes(`title="${TRADINGVIEW_NOTICE}"`), 'the notice is its description');
	// Outside the plot, so it never covers the series or a label.
	const plot = html.slice(html.indexOf('class="plot'), html.indexOf('class="sui-series-attribution'));
	assert.ok(plot.includes('class="host'), 'the plot comes first');
	assert.ok(!plot.includes('tradingview.com'), 'nothing in the plot links to TradingView');
});

test('the notice is word for word the one in Lightweight Charts\' NOTICE file', () => {
	assert.equal(TRADINGVIEW_URL, 'https://www.tradingview.com/');
	assert.equal(TRADINGVIEW_NOTICE, 'TradingView Lightweight Charts™ Copyright (с) 2025 TradingView, Inc. https://www.tradingview.com/');
});
