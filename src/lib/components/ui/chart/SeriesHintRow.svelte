<script lang="ts">
	import type { Snippet } from 'svelte';
	import ChartHint from './ChartHint.svelte';

	// The row under a SeriesChart's plot: its readout and hint. The hint is
	// held unseen in the row's one grid cell, under what shows there, so the
	// row is as tall as the hint wraps at any width and font size, whatever
	// shows. markersPossible holds the longer hint that also says how to see
	// a trade, so the row keeps its height when markers come and go. On its
	// own it stands in for the row while a chart loads, hidden from screen
	// readers, with children such as a skeleton bar over the held hint;
	// SeriesChart draws its readout in the same row with standIn off.
	let {
		noun = 'price',
		hint,
		markersPossible = false,
		standIn = true,
		children
	}: {
		/** What a point is, as the chart's `noun`. */
		noun?: string;
		/** The chart's own `hint`, if it has one: held instead of the default. */
		hint?: string;
		/** Hold the hint with markers, as the chart's `markersPossible`. */
		markersPossible?: boolean;
		/** Hide the whole row from screen readers, as a stand-in; SeriesChart passes false. */
		standIn?: boolean;
		/** What shows in the row, over the held hint. */
		children?: Snippet;
	} = $props();
</script>

<div class="sui-series-readout" aria-hidden={standIn ? 'true' : undefined}>
	<!-- Only holds the row's size: never seen or read. -->
	<div class="held" aria-hidden="true">
		{#if hint}
			<span class="hint">{hint}</span>
		{:else}
			<ChartHint {noun} withMarkers={markersPossible} />
		{/if}
	</div>
	{#if children}
		<div class="shown">{@render children()}</div>
	{/if}
</div>

<style>
	/* One cell: the held hint and what shows sit on top of each other, so
	   the row is as tall as the taller of them. */
	.sui-series-readout {
		display: grid;
		min-height: 1.5rem;
		margin-top: var(--space-2);
		font-variant-numeric: tabular-nums;
	}
	.held,
	.shown {
		grid-area: 1 / 1;
		min-width: 0;
	}
	.held {
		visibility: hidden;
	}
	.sui-series-readout :global(.hint) {
		color: var(--muted);
		font-size: var(--text-md);
	}
	/* On a phone the hint and a trade wrap to two lines; keep room for them
	   so the page below does not jump. */
	@media (max-width: 600px) {
		.sui-series-readout {
			min-height: 2.6rem;
		}
	}
</style>
