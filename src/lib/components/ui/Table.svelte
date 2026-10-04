<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		rowHover = true,
		class: extraClass = '',
		children
	}: {
		/**
		 * Highlights the row under the pointer. Turn it off when rows are not
		 * clickable, so the highlight does not suggest that they are.
		 */
		rowHover?: boolean;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="sui-table-wrap">
	<table class="sui-table {extraClass}" class:row-hover={rowHover}>
		{@render children?.()}
	</table>
</div>

<style>
	.sui-table-wrap {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.sui-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
	}

	.sui-table :global(th) {
		text-align: left;
		font-weight: 600;
		color: var(--muted);
		font-size: var(--text-2xs);
		text-transform: uppercase;
		letter-spacing: 0.07em;
		padding: var(--space-2) var(--space-3-5);
		background: var(--card-alt);
		border-bottom: 1px solid var(--border);
		white-space: nowrap;
	}

	.sui-table :global(td) {
		padding: var(--space-2-5) var(--space-3-5);
		border-top: 1px solid var(--border);
		vertical-align: middle;
	}

	.sui-table :global(tbody tr:first-child td) {
		border-top: 0;
	}

	.sui-table.row-hover :global(tbody tr:hover td) {
		background: var(--card-alt);
	}

	.sui-table :global(.num) {
		text-align: right;
	}

	.sui-table :global(tr:last-child td) {
		border-bottom: none;
	}
</style>
