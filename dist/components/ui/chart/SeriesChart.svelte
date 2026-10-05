<script lang="ts">
	import { Area, Chart, Circle, Html, RectClipPath, Spline, Svg, type ChartState } from 'layerchart';
	import { untrack } from 'svelte';
	import { axisTime, chartDay, chartTime, spansYears } from '../../../chart/dates.js';
	import {
		candleReading,
		candleTrend,
		candleWidth,
		carriedIndex,
		guideLabels,
		guideValues,
		hasCandles,
		inGap,
		isCandle,
		lonePoints,
		markerKey,
		markersInTime,
		nearestIndex,
		plotPoints,
		timeTicks,
		valueBounds,
		withinPlotHeight,
		type PlottedPoint,
		type SeriesMarker,
		type SeriesPoint
	} from '../../../chart/series.js';
	import type { ChartConfig } from './chart-utils.js';
	import ChartContainer from './ChartContainer.svelte';
	import ChartHint from './ChartHint.svelte';
	import ChartTooltip from './ChartTooltip.svelte';

	// A price or value over time, inspected by pointer, finger, keyboard and
	// screen reader alike: a tooltip and crosshair for a mouse, the readout
	// under the chart for touch and screen readers, a hidden range slider for
	// the keyboard, and Escape to hide the tooltip. Drawn as a line over a
	// gradient, or as candles when the points carry open, high and low.

	const uid = $props.id();

	let {
		points = [],
		kind = 'line',
		height = 260,
		markers = [],
		label = 'Price history',
		noun = 'price',
		hint,
		empty = 'Not enough history to draw a chart.',
		byTime = false,
		gap = 0,
		fixed = false,
		baseline = false,
		guides = true,
		timeAxis = true,
		live = false,
		animate = true,
		format = (n: number) => n.toLocaleString(),
		axisFormat,
		formatTime = chartTime,
		formatDay = chartDay,
		change,
		class: extraClass = ''
	}: {
		points: SeriesPoint[];
		/** Candles need every point to carry o, h and l; otherwise a line is drawn. */
		kind?: 'line' | 'candles';
		height?: number;
		markers?: SeriesMarker[];
		label?: string;
		/** What a point is, for the default hint: "price", "market cap". */
		noun?: string;
		/** Text under the chart while nothing is inspected; by default, how to inspect. */
		hint?: string;
		/** Shown in place of the chart when there are fewer than two points. */
		empty?: string;
		/** Place points by their time rather than evenly, so gaps show. */
		byTime?: boolean;
		/** With byTime, break the line where points are further apart than this, in ms. */
		gap?: number;
		/** Keep height in pixels at any width, rather than scaling with it. */
		fixed?: boolean;
		/** Draw a zero line, keep it in view and fill toward it: above it reads as gain, below as loss. */
		baseline?: boolean;
		/** Faint horizontal lines at round values, labelled at the right edge. */
		guides?: boolean;
		/** Times along the bottom edge. */
		timeAxis?: boolean;
		/** The last point is now: its dot pulses. */
		live?: boolean;
		/** Draw the line in and fade the fill when the data changes; off under reduced motion anyway. */
		animate?: boolean;
		/** How a value reads when inspected. */
		format?: (n: number) => string;
		/** How a value reads on the plot's own labels: the guides, zero and the inspected level. `format` by default, so a shorter one keeps them apart on a phone. */
		axisFormat?: (n: number) => string;
		/** How a moment reads: "Sep 25, 5:21 AM". */
		formatTime?: (t: number, withYear: boolean) => string;
		/** How a day reads: "Sep 24". */
		formatDay?: (t: number, withYear: boolean) => string;
		/** With this, an inspected point also shows its change from the first point, as this formats it. */
		change?: (difference: number) => string;
		class?: string;
	} = $props();

	// Space above and below the line, so its peaks and troughs are not cut off.
	const PAD = 8;
	// The height of the row of times along the bottom, which guide labels keep out of.
	const TICK_ROW = 16;

	let context = $state<ChartState<PlottedPoint>>();

	const formatAxis = $derived(axisFormat ?? format);
	const candles = $derived(kind === 'candles' && hasCandles(points));
	const plotted = $derived(plotPoints(points, byTime, gap));
	const lone = $derived(lonePoints(plotted));
	const bounds = $derived(valueBounds(plotted, baseline, candles));
	const markersAlong = $derived(markersInTime(points, markers));
	const withYear = $derived(spansYears(points));
	const spanMs = $derived(points.length > 1 ? points[points.length - 1].t - points[0].t : 0);

	// Green when the range ends higher than it started, red when lower. The
	// line, its fill and the tooltip all take this one colour.
	const up = $derived(points.length > 1 ? points[points.length - 1].p >= points[0].p : true);
	const lineColor = $derived(up ? 'var(--up)' : 'var(--down)');
	// ChartTooltip only draws a row, and calls its formatter, for a series
	// with a label, so the one series needs one even though it is never shown.
	const config = $derived({ p: { label: 'Value', color: lineColor } } satisfies ChartConfig);
	const gradientId = $derived(`sui-series-fill-${uid.replace(/:/g, '')}`);

	const sizing = $derived(fixed ? `height: ${height}px; aspect-ratio: auto` : `aspect-ratio: 800 / ${height}`);

	// The marks are drawn afresh, and animated in, when the series changes.
	const seriesKey = $derived(`${kind}|${plotted.length}|${plotted[0]?.t ?? 0}|${plotted[plotted.length - 1]?.t ?? 0}`);

	// What is being inspected. The pointer, the keyboard slider and the trade
	// markers all set it, and the tooltip, crosshair and readout follow it.
	let inspectedIndex = $state<number | null>(null);
	let pointerInGap = $state(false);
	let hoveredMarker = $state<SeriesMarker | null>(null);
	let pickedMarker = $state<SeriesMarker | null>(null);
	// A finger covers a floating tooltip, so touch inspects through the
	// readout alone, and it stays after the finger lifts.
	let touching = $state(false);
	// Escape hides the tooltip until the next inspection (WCAG 1.4.13).
	let tooltipDismissed = $state(false);
	// While the slider has focus it announces each point itself, and a
	// pointer scrubbing across would announce every point it passes.
	let sliderFocused = $state(false);
	let scrubbing = $state(false);

	const inspected = $derived(inspectedIndex == null ? null : (plotted[inspectedIndex] ?? null));
	// A marker under the pointer or focus comes first, then an inspected
	// point, so inspecting after a pick shows the point, and then the pick.
	const shownMarker = $derived(hoveredMarker ?? (inspected ? null : pickedMarker));

	// New points keep what is inspected on the same moment, so a live tick
	// does not throw away a keyboard or touch inspection. When that moment is
	// gone, as when another range arrives, the inspection ends.
	let previousPlotted: PlottedPoint[] = [];
	$effect.pre(() => {
		const next = plotted;
		untrack(() => {
			inspectedIndex = carriedIndex(previousPlotted, next, inspectedIndex);
			if (inspectedIndex == null) pointerInGap = false;
			previousPlotted = next;
		});
	});

	// New markers, from another range or view, leave nothing picked.
	const markerKeys = $derived(markers.map(markerKey).join('\n'));
	$effect.pre(() => {
		void markerKeys;
		untrack(() => {
			pickedMarker = null;
			hoveredMarker = null;
		});
	});

	/** Markers in pixels on this chart, leaving out those well off the plotted range. */
	function placeMarkers(chart: ChartState<PlottedPoint>) {
		return markersAlong
			.map((marker) => ({ ...marker, left: marker.along * chart.width, top: chart.yScale(marker.price) }))
			.filter((marker) => withinPlotHeight(marker.top, chart.height));
	}

	function isPicked(marker: SeriesMarker) {
		return pickedMarker != null && markerKey(pickedMarker) === markerKey(marker);
	}

	// The tooltip shows what is inspected, unless a finger is down or Escape hid it.
	$effect(() => {
		const chart = context;
		if (!chart) return;
		const marker = hoveredMarker;
		const point = inspected;
		const visible = !touching && !tooltipDismissed;
		untrack(() => {
			if (visible && marker) {
				// The tooltip needs a point of the series to draw; it shows the trade instead.
				const along = markersAlong.find((candidate) => markerKey(candidate) === markerKey(marker))?.along ?? 1;
				const nearest = plotted[nearestIndex(plotted, xAlong(along))];
				chart.tooltip.show({ data: nearest, point: { x: along * chart.width, y: chart.yScale(marker.price) } });
				return;
			}
			if (visible && point && !pointerInGap) chart.tooltip.show({ data: point });
			else chart.tooltip.hide();
		});
	});

	/** xAlong is the x value this fraction of the way across the plot. */
	function xAlong(fraction: number) {
		const first = plotted[0].x;
		return first + Math.min(1, Math.max(0, fraction)) * (plotted[plotted.length - 1].x - first);
	}

	/** inspectAt finds the point under a pointer at this many pixels from the left of the plot. */
	function inspectAt(chart: ChartState<PlottedPoint>, left: number) {
		const x = xAlong(left / chart.width);
		const index = nearestIndex(plotted, x);
		inspectedIndex = index;
		pointerInGap = inGap(plotted[index], x, byTime, gap);
		tooltipDismissed = false;
		scrubbing = true;
	}

	function onPlotPointer(event: PointerEvent) {
		if (!context || (event.target as Element).closest('.marker')) return;
		touching = event.pointerType === 'touch';
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		inspectAt(context, event.clientX - rect.left);
	}

	/** A marker under the pointer or focus takes over from any inspected point. */
	function showMarker(marker: SeriesMarker) {
		inspectedIndex = null;
		pointerInGap = false;
		tooltipDismissed = false;
		scrubbing = false;
		hoveredMarker = marker;
	}

	function stopInspecting() {
		inspectedIndex = null;
		pointerInGap = false;
		touching = false;
		scrubbing = false;
	}

	let plotElement = $state<HTMLElement>();

	// A touch inspection stays until the next tap outside the chart or a scroll.
	$effect(() => {
		if (!touching) return;
		const tapOutside = (event: PointerEvent) => {
			if (plotElement && !plotElement.contains(event.target as Node)) stopInspecting();
		};
		window.addEventListener('pointerdown', tapOutside, true);
		window.addEventListener('scroll', stopInspecting, { capture: true, passive: true });
		return () => {
			window.removeEventListener('pointerdown', tapOutside, true);
			window.removeEventListener('scroll', stopInspecting, true);
		};
	});

	function onWindowKey(event: KeyboardEvent) {
		if (event.key === 'Escape' && (inspected || hoveredMarker)) tooltipDismissed = true;
	}

	// Keyboard inspection: a visually hidden range input that moves the same
	// cursor as the pointer.
	const sliderIndex = $derived(inspectedIndex ?? plotted.length - 1);
	const sliderPoint = $derived(plotted[Math.min(sliderIndex, plotted.length - 1)]);

	function inspectIndex(index: number) {
		inspectedIndex = index;
		pointerInGap = false;
		touching = false;
		tooltipDismissed = false;
		scrubbing = false;
	}

	const withMarkers = $derived(markersAlong.length > 0);
	/** changeSince is a point's change from the first, "+$12.40 since Sep 24", when the caller asked for it. */
	function changeSince(point: PlottedPoint | null) {
		if (!change || !point || plotted.length === 0) return null;
		return { text: `${change(point.p - plotted[0].p)} since ${formatDay(plotted[0].t, withYear)}`, up: point.p >= plotted[0].p };
	}
	const changeText = $derived(changeSince(inspected));

	/** candleText reads a candle's open, high and low, for the readout. */
	function candleText(point: SeriesPoint) {
		return isCandle(point) ? `open ${format(point.o)}, high ${format(point.h)}, low ${format(point.l)}` : '';
	}

	// A candle reads open, high, low and close, each named; a line point reads its value.
	const sliderText = $derived.by(() => {
		if (!sliderPoint) return undefined;
		const since = changeSince(sliderPoint);
		const value = candles && isCandle(sliderPoint) ? candleReading(sliderPoint, format) : format(sliderPoint.p);
		return `${value}, ${formatTime(sliderPoint.t, withYear)}${since ? `, ${since.text}` : ''}`;
	});

	/** A marker's name to screen readers: the trade, when, and any note, as the readout shows them. */
	function markerLabel(marker: SeriesMarker) {
		return [marker.title, formatTime(marker.t, withYear), marker.note?.text].filter(Boolean).join(', ');
	}

	// The slider and a focused marker announce themselves, and a pointer
	// scrubbing would announce every point, so the readout is only live for
	// the rest, such as a marker picked by pointer. The hint shown while
	// nothing is inspected sits outside the live part, so a caller's hint
	// that changes with every live tick is never read out (WCAG 2.2.2).
	const readoutLive = $derived(!sliderFocused && !scrubbing && !hoveredMarker);

	// The guides and their labels, and the times along the bottom.
	const guideLines = $derived(guides && bounds ? guideValues(bounds.min, bounds.span).filter((value) => !(baseline && value === 0)) : []);
	// A tick that would repeat the label before it, as two days can in a
	// 48-hour range, is left out.
	const tickLabels = $derived(
		(timeAxis ? timeTicks(plotted) : [])
			.map((tick) => ({ ...tick, label: axisTime(tick.t, spanMs, withYear) }))
			.filter((tick, index, all) => index === 0 || tick.label !== all[index - 1].label)
	);
	const last = $derived(plotted[plotted.length - 1]);

	/** The guides that get a label: none in the time axis's row, and one at most on a short chart. */
	function labelledGuides(chart: ChartState<PlottedPoint>) {
		const placed = guideLines.map((value) => ({ value, y: chart.yScale(value) }));
		return guideLabels(placed, chart.height, tickLabels.length > 0 ? TICK_ROW : 0);
	}
</script>

<svelte:window onkeydown={onWindowKey} />

{#snippet line(chart: ChartState<PlottedPoint>, tone: 'line' | 'up' | 'down' = 'line')}
	<!-- Filled down to the bottom edge, or toward zero with a baseline, in a
	     gradient that fades out so the line stays the subject. -->
	<Area z="run" y0={() => (baseline ? 0 : chart.yScale.domain()[0])} fill="url(#{gradientId}-{tone})" class="area" />
	<Spline z="run" pathLength={1} class="line" />
	{#each lone as point (point.t)}
		<Circle cx={chart.xScale(point.x)} cy={chart.yScale(point.p)} r={2} class="lone" />
	{/each}
{/snippet}

{#snippet candleMarks(chart: ChartState<PlottedPoint>)}
	{@const width = candleWidth(chart.width, plotted.length)}
	{#each plotted as point, index (point.t)}
		{#if isCandle(point)}
			{@const x = chart.xScale(point.x)}
			{@const top = chart.yScale(Math.max(point.o, point.p))}
			{@const bottom = top + Math.max(1, chart.yScale(Math.min(point.o, point.p)) - top)}
			<!-- Shape as well as colour: a rising candle is hollow, a falling one
			     filled. The wick stops at the body, so a hollow body stays empty. -->
			<g class="candle {candleTrend(point)}" class:inspected={inspected === point && !pointerInGap} style="--i: {Math.min(index, 80)}">
				<line x1={x} y1={chart.yScale(point.h)} x2={x} y2={top} class="wick" />
				<line x1={x} y1={bottom} x2={x} y2={chart.yScale(point.l)} class="wick" />
				<rect x={x - width / 2} y={top} {width} height={bottom - top} class="body" />
			</g>
		{/if}
	{/each}
{/snippet}

{#if !bounds}
	<p class="sui-series-empty" style={sizing}>{empty}</p>
{:else}
	<div
		class="sui-series-chart {extraClass}"
		class:animate
		style="--stroke: {lineColor}"
		bind:this={plotElement}
		onpointermove={onPlotPointer}
		onpointerdown={onPlotPointer}
		onpointerleave={(event) => {
			if (event.pointerType !== 'touch') stopInspecting();
		}}
		onpointercancel={stopInspecting}
		role="presentation"
	>
		<!-- Before the chart, so keyboard focus reaches it before the trade
		     markers. It sits on the inspected point, so screen magnifiers follow. -->
		<input
			class="scrub"
			style={context && sliderPoint ? `left: ${context.xScale(sliderPoint.x)}px; top: ${context.yScale(sliderPoint.p)}px` : undefined}
			type="range"
			min="0"
			max={plotted.length - 1}
			step="1"
			value={sliderIndex}
			aria-label={label}
			aria-valuetext={sliderText}
			onfocus={() => {
				sliderFocused = true;
				pickedMarker = null;
				inspectIndex(sliderIndex);
			}}
			onblur={() => {
				sliderFocused = false;
				stopInspecting();
			}}
			oninput={(event) => inspectIndex(event.currentTarget.valueAsNumber)}
		/>
		<ChartContainer {config} style={sizing}>
			<Chart
				bind:context
				data={plotted}
				x="x"
				y="p"
				yDomain={[bounds.min, bounds.min + bounds.span]}
				yPadding={[PAD, PAD]}
				series={[{ key: 'p', label: config.p.label, color: lineColor }]}
				tooltipContext={{ mode: 'manual' }}
			>
				{#snippet children({ context: chart })}
					{@const active = inspected && !pointerInGap ? inspected : null}
					<Svg role="img" aria-label={label}>
						<defs>
							<!-- One gradient in the line's colour, and one each for the gain
							     and loss halves of a baseline chart. -->
							{#each ['line', 'up', 'down'] as tone (tone)}
								<linearGradient id="{gradientId}-{tone}" x1="0" y1="0" x2="0" y2="1" class="fill {tone}">
									<stop offset="0%" class="fill-start" />
									<stop offset="100%" class="fill-end" />
								</linearGradient>
							{/each}
						</defs>
						{#each guideLines as value (value)}
							{@const y = chart.yScale(value)}
							<line x1={0} y1={y} x2={chart.width} y2={y} class="guide" />
						{/each}
						{#key seriesKey}
							{#if candles}
								{@render candleMarks(chart)}
							{:else if baseline}
								{@const zeroTop = chart.yScale(0)}
								<!-- The same line twice, clipped above zero as gain and below as loss. -->
								<RectClipPath x={0} y={0} width={chart.width} height={zeroTop}>
									<g class="gain">{@render line(chart, 'up')}</g>
								</RectClipPath>
								<RectClipPath x={0} y={zeroTop} width={chart.width} height={chart.height - zeroTop}>
									<g class="loss">{@render line(chart, 'down')}</g>
								</RectClipPath>
								<line x1={0} y1={zeroTop} x2={chart.width} y2={zeroTop} class="zero" />
							{:else}
								{@render line(chart)}
							{/if}
						{/key}
						{#if active}
							<line x1={chart.xScale(active.x)} y1={0} x2={chart.xScale(active.x)} y2={chart.height} class="cursor" />
							<line x1={0} y1={chart.yScale(active.p)} x2={chart.width} y2={chart.yScale(active.p)} class="cursor level" />
						{/if}
					</Svg>
					<Html>
						<!-- The labels repeat what the slider and the readout say, so
						     screen readers skip them. -->
						{#each labelledGuides(chart) as value (value)}
							<span class="guide-label" style="top: {chart.yScale(value)}px" aria-hidden="true">{formatAxis(value)}</span>
						{/each}
						{#each tickLabels as tick, index (tick.t)}
							<span class="tick" class:first={index === 0} class:last={index === tickLabels.length - 1} style="left: {chart.xScale(tick.x)}px" aria-hidden="true">{tick.label}</span>
						{/each}
						{#if !candles && last && !active}
							<!-- The latest point, pulsing a few times when it is live, and
							     again when a new one arrives. -->
							{#key last.t}
								<span class="dot end" class:live style="left: {chart.xScale(last.x)}px; top: {chart.yScale(last.p)}px{baseline ? `; --stroke: ${last.p >= 0 ? 'var(--up)' : 'var(--down)'}` : ''}"></span>
							{/key}
						{/if}
						{#if active}
							<!-- With a baseline the inspected point is a gain or a loss by its side of zero. -->
							<span
								class="dot"
								class:hidden={candles}
								style="left: {chart.xScale(active.x)}px; top: {chart.yScale(active.p)}px{baseline
									? `; --stroke: ${active.p >= 0 ? 'var(--up)' : 'var(--down)'}`
									: ''}"
							></span>
							<span class="level-label" style="top: {chart.yScale(active.p)}px" aria-hidden="true">{formatAxis(active.p)}</span>
						{/if}
						{#if baseline}
							<span class="zero-label" style="top: {chart.yScale(0)}px" aria-hidden="true">{formatAxis(0)}</span>
						{/if}
						{#each placeMarkers(chart) as marker (markerKey(marker))}
							<button
								class="marker {marker.side}"
								class:picked={isPicked(marker)}
								style="left: {marker.left}px; top: {marker.top}px"
								aria-label={markerLabel(marker)}
								aria-pressed={isPicked(marker)}
								onclick={() => (pickedMarker = isPicked(marker) ? null : marker)}
								onpointerenter={(event) => {
									touching = event.pointerType === 'touch';
									showMarker(marker);
								}}
								onpointerleave={() => (hoveredMarker = null)}
								onfocus={() => {
									touching = false;
									showMarker(marker);
								}}
								onblur={() => (hoveredMarker = null)}
							>
								<svg viewBox="0 0 12 12" aria-hidden="true">
									<!-- Shape as well as colour: up for a buy, down for a sell. -->
									<polygon points={marker.side === 'buy' ? '6,1 11.5,10.5 0.5,10.5' : '0.5,1.5 11.5,1.5 6,11'} />
								</svg>
							</button>
						{/each}
					</Html>
					<ChartTooltip
						aria-hidden="true"
						hideIndicator
						labelFormatter={() => (hoveredMarker ? hoveredMarker.title : inspected ? formatTime(inspected.t, withYear) : '')}
					>
						{#snippet formatter({ value })}
							{#if hoveredMarker}
								<span class="tooltip-value">{formatTime(hoveredMarker.t, withYear)}</span>
							{:else if candles && inspected && isCandle(inspected)}
								<dl class="ohlc" class:rise={inspected.p >= inspected.o} class:fall={inspected.p < inspected.o}>
									<dt>O</dt><dd>{format(inspected.o)}</dd>
									<dt>H</dt><dd>{format(inspected.h)}</dd>
									<dt>L</dt><dd>{format(inspected.l)}</dd>
									<dt>C</dt><dd>{format(inspected.p)}</dd>
								</dl>
							{:else}
								<span class="tooltip-value">{format(value as number)}</span>
							{/if}
						{/snippet}
					</ChartTooltip>
				{/snippet}
			</Chart>
		</ChartContainer>
	</div>

	<div class="sui-series-readout">
		<div class="readout-inspected" aria-live={readoutLive ? 'polite' : 'off'}>
			{#if shownMarker}
				<strong class={shownMarker.side === 'buy' ? 'buy-text' : 'sell-text'}>{shownMarker.title}</strong>
				<span>{formatTime(shownMarker.t, withYear)}</span>
				{#if shownMarker.note}
					<span class={shownMarker.note.up ? 'up-text' : 'down-text'}>{shownMarker.note.text}</span>
				{/if}
			{:else if inspected && pointerInGap}
				<span class="hint">No snapshots in this gap</span>
			{:else if inspected}
				<strong>{#if candles}<span class="visually-hidden">close </span>{/if}{format(inspected.p)}</strong>
				<span>{formatTime(inspected.t, withYear)}</span>
				{#if candles && isCandle(inspected)}
					<span class="candle-text">{candleText(inspected)}</span>
				{/if}
				{#if changeText}
					<span class={changeText.up ? 'up-text' : 'down-text'}>{changeText.text}</span>
				{/if}
			{/if}
		</div>
		{#if !shownMarker && !inspected}
			{#if hint}
				<span class="hint">{hint}</span>
			{:else}
				<ChartHint {noun} {withMarkers} />
			{/if}
		{/if}
	</div>
{/if}

<style>
	/* A sideways drag inspects and an upward one scrolls the page. */
	.sui-series-chart {
		position: relative;
		touch-action: pan-y;
	}
	/* This chart drives its tooltip itself, so LayerChart's own pointer
	   handling must not show or hide it. */
	.sui-series-chart :global(.lc-tooltip-context) {
		pointer-events: none;
	}
	.sui-series-chart:has(.scrub:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}
	.scrub {
		position: absolute;
		left: 100%;
		top: 50%;
		width: 1px;
		height: 1px;
		margin: 0;
		padding: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
	}

	/* The line and its fill */
	.sui-series-chart :global(.line) {
		fill: none;
		stroke: var(--stroke);
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.sui-series-chart :global(.lone) {
		fill: var(--stroke);
	}
	/* The fill fades from the line colour to nothing. */
	.fill-start {
		stop-color: var(--stroke);
		stop-opacity: 0.28;
	}
	.fill-end {
		stop-color: var(--stroke);
		stop-opacity: 0;
	}
	.gain {
		--stroke: var(--up);
	}
	.loss {
		--stroke: var(--down);
	}
	.fill.up {
		--stroke: var(--up);
	}
	.fill.down {
		--stroke: var(--down);
	}

	/* Drawn in from left to right when the series arrives, with the fill
	   fading up behind it; a candle rises into place, each a little after
	   the one before. Nothing moves under reduced motion. */
	@media (prefers-reduced-motion: no-preference) {
		.animate :global(.line) {
			stroke-dasharray: 1;
			stroke-dashoffset: 1;
			animation: sui-series-draw 900ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
		}
		.animate :global(.area),
		.animate :global(.lone) {
			animation: sui-series-fade 700ms ease-out 250ms both;
		}
		.animate .candle {
			transform-box: fill-box;
			transform-origin: center;
			animation: sui-series-rise 360ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
			animation-delay: calc(var(--i) * 6ms);
		}
		.animate .dot.end {
			animation: sui-series-fade 300ms ease-out 900ms both;
		}
		.dot.end.live::after {
			/* A few pulses, not forever (WCAG 2.2.2); a new last point starts them again. */
			animation: sui-series-pulse 2s ease-out 3;
		}
	}
	@keyframes sui-series-draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes sui-series-fade {
		from {
			opacity: 0;
		}
	}
	@keyframes sui-series-rise {
		from {
			opacity: 0;
			transform: scaleY(0.4);
		}
	}
	@keyframes sui-series-pulse {
		from {
			transform: scale(1);
			opacity: 0.7;
		}
		to {
			transform: scale(3);
			opacity: 0;
		}
	}

	/* Candles */
	.candle .wick {
		stroke: var(--candle);
		stroke-width: 1;
	}
	.candle .body {
		fill: var(--candle);
		stroke: var(--candle);
		stroke-width: 1;
	}
	.candle.rise .body {
		fill: transparent;
	}
	.candle.rise {
		--candle: var(--up);
	}
	.candle.fall {
		--candle: var(--down);
	}
	.candle.inspected .body {
		stroke: var(--fg);
		stroke-width: 1;
	}

	/* Guides, the zero line, the crosshair and their labels */
	.guide {
		stroke: var(--border);
		stroke-width: 1;
		stroke-dasharray: 2 4;
		opacity: 0.8;
	}
	.guide-label,
	.tick,
	.zero-label,
	.level-label {
		position: absolute;
		padding: 0 var(--space-1);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--card) 85%, transparent);
		color: var(--muted);
		font-size: var(--text-2xs);
		line-height: 1.4;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		pointer-events: none;
	}
	.guide-label {
		left: 0;
		transform: translateY(-100%);
		opacity: 0.9;
	}
	.tick {
		bottom: 0;
		transform: translateX(-50%);
	}
	.tick.first {
		transform: none;
	}
	.tick.last {
		transform: translateX(-100%);
	}
	.zero {
		stroke: var(--muted);
		stroke-width: 1;
		stroke-dasharray: 4 4;
	}
	.zero-label {
		left: 0;
		transform: translateY(-100%);
	}
	.cursor {
		stroke: var(--border-strong);
		stroke-width: 1;
		stroke-dasharray: 3 3;
	}
	.level-label {
		right: 0;
		transform: translateY(-50%);
		background: var(--fg);
		color: var(--bg);
		font-weight: 600;
	}
	.dot {
		position: absolute;
		width: 9px;
		height: 9px;
		margin: -4.5px 0 0 -4.5px;
		box-sizing: border-box;
		border-radius: 50%;
		background: var(--card);
		border: 2px solid var(--stroke);
		pointer-events: none;
	}
	.dot.hidden {
		display: none;
	}
	.dot.end {
		background: var(--stroke);
	}
	.dot.end::after {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: 50%;
		background: var(--stroke);
		opacity: 0;
	}

	/* Trade markers: a 24px target around an 11px shape. */
	.marker {
		position: absolute;
		width: 24px;
		height: 24px;
		margin: -12px 0 0 -12px;
		padding: 0;
		display: grid;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: none;
		cursor: pointer;
		pointer-events: auto;
	}
	.marker svg {
		width: 11px;
		height: 11px;
		overflow: visible;
	}
	.marker polygon {
		stroke: var(--bg);
		stroke-width: 1.5;
		stroke-linejoin: round;
		paint-order: stroke;
	}
	.marker.buy polygon {
		fill: var(--up);
	}
	.marker.sell polygon {
		fill: var(--down);
	}
	.marker::after {
		content: '';
		position: absolute;
		inset: 3px;
		border-radius: 50%;
		pointer-events: none;
	}
	.marker.picked::after {
		box-shadow: 0 0 0 2px var(--fg);
	}
	.marker:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 0;
	}
	/* A finger needs a 44px target; the ring stays the same size around the shape. */
	@media (pointer: coarse) {
		.marker {
			width: 44px;
			height: 44px;
			margin: -22px 0 0 -22px;
		}
		.marker::after {
			inset: 13px;
		}
	}
	@media (prefers-reduced-motion: no-preference) {
		.marker:hover svg,
		.marker:focus-visible svg {
			transform: scale(1.3);
		}
	}

	/* The tooltip's rows */
	.tooltip-value {
		font-family: var(--font-mono);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.ohlc {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-0-5) var(--space-2);
		margin: 0;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}
	.ohlc dt {
		color: var(--muted);
	}
	.ohlc dd {
		margin: 0;
		text-align: right;
		font-weight: 500;
	}
	.ohlc.rise dd:last-of-type {
		color: var(--up);
	}
	.ohlc.fall dd:last-of-type {
		color: var(--down);
	}

	/* The readout under the chart */
	.sui-series-readout {
		min-height: 1.5rem;
		margin-top: var(--space-2);
		font-variant-numeric: tabular-nums;
	}
	/* Empty while the hint shows, so it takes no room. */
	.readout-inspected {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-0-5) var(--space-3);
		align-items: baseline;
	}
	.sui-series-readout span {
		font-size: var(--text-sm);
	}
	.sui-series-readout span:not(.up-text, .down-text) {
		color: var(--muted);
	}
	.buy-text,
	.up-text {
		color: var(--up);
	}
	.sell-text,
	.down-text {
		color: var(--down);
	}
	/* On a phone the hint and a trade wrap to two lines; keep room for them
	   so the page below does not jump. */
	@media (max-width: 600px) {
		.sui-series-readout {
			min-height: 2.6rem;
		}
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
	.sui-series-empty {
		display: grid;
		place-items: center;
		margin: 0;
		padding: 0 var(--space-4);
		text-align: center;
		color: var(--muted);
		font-size: var(--text-md);
	}
	.hint,
	.sui-series-readout :global(.hint) {
		color: var(--muted);
		font-size: var(--text-md);
	}
</style>
