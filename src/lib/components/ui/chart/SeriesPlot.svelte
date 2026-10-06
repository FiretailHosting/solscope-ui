<script lang="ts">
	import type { ChartState } from 'layerchart';
	import { Area, ChartCore, Spline, Svg } from 'layerchart/svg';
	import { candleTrend, candleWidth, isCandle, type PlottedPoint } from '../../../chart/series.js';

	// The picture inside SeriesChart: its line over a gradient fill, its gain
	// and loss around zero, or its candles, drawn by LayerChart in SVG. It
	// draws only; SeriesChart lays everything read or reached over it with
	// the scales bound out through context. Loaded in a chunk of its own
	// once a chart mounts, with only the LayerChart pieces it draws with, so
	// server rendering and pages without a chart never load it.

	let {
		plotted,
		candles,
		baseline,
		yDomain,
		pad,
		id,
		context = $bindable()
	}: {
		plotted: PlottedPoint[];
		candles: boolean;
		baseline: boolean;
		yDomain: [number, number];
		/** Space above and below the series, in pixels, so peaks and troughs are not cut off. */
		pad: number;
		/** Unique per chart, for the gradient and clip ids. */
		id: string;
		context?: ChartState<PlottedPoint>;
	} = $props();

	const xDomain = $derived<[number, number]>([plotted[0]?.x ?? 0, plotted[plotted.length - 1]?.x ?? 1]);
	// Candles are inset by half a body, so the first and last are not cut in half.
	const inset = (width: number) => (candles ? Math.ceil(candleWidth(width, plotted.length) / 2) + 1 : 0);
	const xRange = $derived(({ width }: { width: number; height: number }) => [inset(width), Math.max(inset(width), width - inset(width))]);
	const yRange = ({ height }: { width: number; height: number }) => [Math.max(pad, height - pad), Math.min(pad, height / 2)];
</script>

<ChartCore bind:context data={plotted} x="x" y="p" {xDomain} {yDomain} {xRange} {yRange} xNice={false} yNice={false} pointerEvents={false}>
	{#snippet children({ context: chart })}
		{@const bottom = chart.yScale.invert?.(chart.height) ?? yDomain[0]}
		<Svg aria-hidden="true" role="presentation">
			{#snippet defs()}
				<!-- One fill in the line's colour, and one each for the gain and loss sides of zero. -->
				{#each ['line', 'up', 'down'] as tone (tone)}
					<linearGradient id="{id}-fill-{tone}" x1="0" y1="0" x2="0" y2="1" class="fill {tone}">
						<stop offset="0%" class="fill-start" />
						<stop offset="100%" class="fill-end" />
					</linearGradient>
				{/each}
				{#if baseline}
					{@const zero = Math.min(chart.height, Math.max(0, chart.yScale(0)))}
					<clipPath id="{id}-gain"><rect x="0" y="0" width={chart.width} height={zero} /></clipPath>
					<clipPath id="{id}-loss"><rect x="0" y={zero} width={chart.width} height={Math.max(0, chart.height - zero)} /></clipPath>
				{/if}
			{/snippet}
			{#if candles}
				{@const width = candleWidth(chart.width, plotted.length)}
				{#each plotted as point (point.t)}
					{#if isCandle(point)}
						{@const x = chart.xScale(point.x)}
						{@const top = chart.yScale(Math.max(point.o, point.p))}
						{@const end = top + Math.max(1, chart.yScale(Math.min(point.o, point.p)) - top)}
						<!-- Shape as well as colour: a rising candle is hollow, a falling one
						     filled. The wick stops at the body, so a hollow body stays empty. -->
						<g class="candle {candleTrend(point)}">
							<line x1={x} y1={chart.yScale(point.h)} x2={x} y2={top} />
							<line x1={x} y1={end} x2={x} y2={chart.yScale(point.l)} />
							<rect x={x - width / 2 + 0.5} y={top + 0.5} width={Math.max(0, width - 1)} height={Math.max(0, end - top - 1)} />
						</g>
					{/if}
				{/each}
			{:else if baseline}
				<!-- The same line twice, clipped above zero as gain and below as loss. -->
				<g class="gain" clip-path="url(#{id}-gain)">
					<Area z="run" y0={() => 0} fill="url(#{id}-fill-up)" class="area" />
					<Spline z="run" class="line" />
				</g>
				<g class="loss" clip-path="url(#{id}-loss)">
					<Area z="run" y0={() => 0} fill="url(#{id}-fill-down)" class="area" />
					<Spline z="run" class="line" />
				</g>
			{:else}
				<Area z="run" y0={() => bottom} fill="url(#{id}-fill-line)" class="area" />
				<Spline z="run" class="line" />
			{/if}
		</Svg>
	{/snippet}
</ChartCore>

<style>
	/* The line and its fill, in the chart's colour, which SeriesChart sets as
	   --stroke from the theme's up and down tokens. */
	:global(.sui-series-chart) :global(.lc-layout-svg) {
		overflow: hidden;
	}
	:global(.sui-series-chart) :global(.line) {
		fill: none;
		stroke: var(--stroke);
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.fill-start {
		stop-color: var(--stroke);
		stop-opacity: 0.28;
	}
	.fill-end {
		stop-color: var(--stroke);
		stop-opacity: 0;
	}
	.gain,
	.fill.up {
		--stroke: var(--up);
	}
	.loss,
	.fill.down {
		--stroke: var(--down);
	}
	/* Around zero, each side fades toward the zero line. */
	.fill.up .fill-end,
	.fill.down .fill-start {
		stop-opacity: 0.04;
	}
	.fill.down .fill-end {
		stop-opacity: 0.28;
	}
	.candle line {
		stroke-width: 1;
		shape-rendering: crispEdges;
	}
	.candle rect {
		stroke-width: 1;
	}
	.candle.rise line,
	.candle.rise rect {
		stroke: var(--up);
	}
	.candle.rise rect {
		fill: none;
	}
	.candle.fall line,
	.candle.fall rect {
		stroke: var(--down);
	}
	.candle.fall rect {
		fill: var(--down);
	}
</style>
