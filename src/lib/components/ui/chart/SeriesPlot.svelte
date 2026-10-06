<script lang="ts">
	import type { ChartState } from 'layerchart';
	import { Area, ChartCore, Spline, Svg } from 'layerchart/svg';
	import { candleMarks, candleTrend, candleWidth, candleWidthByStep, isCandle, type PlottedPoint } from '../../../chart/series.js';

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
		byTime = false,
		yDomain,
		pad,
		id,
		context = $bindable()
	}: {
		plotted: PlottedPoint[];
		candles: boolean;
		baseline: boolean;
		/** Points placed by time, so candles size to the closest two. */
		byTime?: boolean;
		yDomain: [number, number];
		/** Space above and below the series, in pixels, so peaks and troughs are not cut off. */
		pad: number;
		/** Unique per chart, for the gradient and clip ids. */
		id: string;
		context?: ChartState<PlottedPoint>;
	} = $props();

	const xDomain = $derived<[number, number]>([plotted[0]?.x ?? 0, plotted[plotted.length - 1]?.x ?? 1]);
	// A candle's body width: from the closest two candles when placed by
	// time, so none overlaps its neighbour, or from the count when even.
	const xs = $derived(plotted.map((point) => point.x));
	const bodyWidth = (width: number) => (byTime ? candleWidthByStep(width, xs) : candleWidth(width, plotted.length));
	// Candles are inset by half a body, so the first and last are not cut in half.
	const inset = (width: number) => (candles ? Math.ceil(bodyWidth(width) / 2) + 1 : 0);
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
				{@const width = bodyWidth(chart.width)}
				<!-- Keyed by place as well as time, so two candles at one time never clash. -->
				{#each plotted as point, index (`${point.t}:${index}`)}
					{#if isCandle(point)}
						{@const marks = candleMarks(chart.xScale(point.x), chart.yScale(point.h), chart.yScale(point.l), chart.yScale(Math.max(point.o, point.p)), chart.yScale(Math.min(point.o, point.p)), width)}
						<g class="candle {candleTrend(point)}">
							{#if marks.kind === 'thin'}
								<!-- Too narrow for hollow or filled: a line from high to low and a
								     thicker one over the body; colour and the readout tell rise from fall. -->
								<line x1={marks.x} y1={marks.high} x2={marks.x} y2={marks.low} />
								<line class="thin-body" x1={marks.x} y1={marks.top} x2={marks.x} y2={marks.bottom} />
							{:else if marks.kind === 'flat'}
								<!-- Opened and closed at about one price: a level line with the wick through it. -->
								<line x1={marks.x} y1={marks.high} x2={marks.x} y2={marks.low} />
								<line class="flat-body" x1={marks.left} y1={marks.y} x2={marks.right} y2={marks.y} />
							{:else}
								<!-- Shape as well as colour: a rising candle is hollow, a falling one
								     filled. The wick stops at the body, so a hollow body stays empty. -->
								<line x1={marks.x} y1={marks.high} x2={marks.x} y2={marks.top} />
								<line x1={marks.x} y1={marks.bottom} x2={marks.x} y2={marks.low} />
								<rect x={marks.left + 0.5} y={marks.top + 0.5} width={marks.width - 1} height={marks.bottom - marks.top - 1} />
							{/if}
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
	.candle .thin-body,
	.candle .flat-body {
		stroke-width: 2;
		shape-rendering: auto;
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
