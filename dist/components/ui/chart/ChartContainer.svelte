<script lang="ts">
	// Adapted from shadcn-svelte's chart (MIT, see LICENSE.txt in this folder).
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import ChartStyle from './ChartStyle.svelte';
	import { setChartContext, type ChartConfig } from './chart-utils.js';

	const uid = $props.id();

	let {
		ref = $bindable(null),
		id = uid,
		config,
		class: extraClass = '',
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLDivElement | null;
		/** Series names and colours, keyed by series key. */
		config: ChartConfig;
		class?: string;
		children?: Snippet;
	} = $props();

	const chartId = $derived(`chart-${id || uid.replace(/:/g, '')}`);

	setChartContext({
		get config() {
			return config;
		}
	});
</script>

<div bind:this={ref} data-chart={chartId} class="sui-chart {extraClass}" {...restProps}>
	<ChartStyle id={chartId} {config} />
	{@render children?.()}
</div>

<style>
	.sui-chart {
		display: flex;
		justify-content: center;
		aspect-ratio: 16 / 9;
		overflow: visible;
		font-size: var(--text-xs);
	}

	.sui-chart :global(.lc-root-container) {
		width: 100%;
	}

	/* Recessive grid lines, and no tick marks or axis rules: the grid already
	   marks the baseline, and a rule drawn after the marks would cover them. */
	.sui-chart :global(.lc-line) {
		stroke: color-mix(in srgb, var(--border) 50%, transparent);
	}

	.sui-chart :global(.lc-axis-tick),
	.sui-chart :global(.lc-rule-x-line:not(.lc-grid-x-rule)),
	.sui-chart :global(.lc-rule-y-line:not(.lc-grid-y-rule)) {
		stroke-width: 0;
	}

	.sui-chart :global(.lc-grid-x-radial-circle),
	.sui-chart :global(.lc-grid-x-radial-line),
	.sui-chart :global(.lc-grid-y-radial-circle),
	.sui-chart :global(.lc-grid-y-radial-line) {
		stroke: var(--border);
	}

	.sui-chart :global(.lc-axis-tick-label) {
		fill: var(--muted);
		font-weight: 400;
	}

	.sui-chart :global(.lc-labels-text:not([fill])) {
		fill: var(--fg);
	}

	.sui-chart :global(text) {
		stroke: transparent;
	}

	.sui-chart :global(.lc-text) {
		font-size: var(--text-xs);
	}

	.sui-chart :global(.lc-text-svg) {
		overflow: visible;
	}

	/* Hovering a point: no ring around it, no line through it, and the other
	   series of a stacked chart keep their full opacity. */
	.sui-chart :global(.lc-highlight-point) {
		stroke: transparent;
	}

	.sui-chart :global(.lc-highlight-line) {
		stroke-width: 0;
	}

	.sui-chart :global(.lc-area-path),
	.sui-chart :global(.lc-highlight-line),
	.sui-chart :global(.lc-highlight-point),
	.sui-chart :global(.lc-spline-path) {
		opacity: 1;
	}

	.sui-chart :global(.lc-tooltip-rects-g),
	.sui-chart :global(.lc-layout-svg-g) {
		fill: transparent;
	}

	.sui-chart :global(.lc-legend-swatch-group) {
		align-items: center;
		gap: var(--space-4);
	}

	/* Legend items are buttons: drop the browser's button look. */
	.sui-chart :global(.lc-legend-swatch-button) {
		align-items: center;
		gap: var(--space-1-5);
		padding: 0;
		background: none;
		border: 0;
		color: inherit;
	}

	.sui-chart :global(.lc-legend-swatch-label) {
		color: var(--muted);
	}

	.sui-chart :global(.lc-legend-swatch) {
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 2px;
	}
</style>
