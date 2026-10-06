<script lang="ts">
	import type { Snippet } from 'svelte';
	import ChartHint from './ChartHint.svelte';

	// The row under a SeriesChart's plot: its readout and hint. The hint is
	// held unseen in the row's one grid cell, under what shows there, so the
	// row is as tall as the hint wraps at any width and font size, whatever
	// shows. markersPossible also holds the longer hint that says how to see
	// a trade, beside the chart's own hint if it has one, so the row keeps
	// its height when markers or that hint come and go. On its own it stands
	// in for the row while a chart loads, hidden from screen readers, with
	// children such as a skeleton bar over the held hint; SeriesChart draws
	// its readout in the same row with standIn off.
	let {
		noun = 'price',
		hint,
		markersPossible = false,
		standIn = true,
		children
	}: {
		/** What a point is, as the chart's `noun`. */
		noun?: string;
		/** The chart's own `hint`, if it has one: held instead of the default, or with the marker hint under markersPossible. */
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
			<div><span class="hint">{hint}</span></div>
		{/if}
		{#if !hint || markersPossible}
			<div><ChartHint {noun} withMarkers={markersPossible} /></div>
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
	.shown,
	.held > div {
		grid-area: 1 / 1;
		min-width: 0;
	}
	/* Held hints sit on top of each other too: the taller one counts. */
	.held {
		display: grid;
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
