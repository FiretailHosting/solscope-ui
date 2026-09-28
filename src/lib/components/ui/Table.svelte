<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: extraClass = '',
		children
	}: {
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="sui-table-wrap">
	<table class="sui-table {extraClass}">
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
		font-size: 0.88rem;
		font-variant-numeric: tabular-nums;
	}

	.sui-table :global(th) {
		text-align: left;
		font-weight: 600;
		color: var(--muted);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		padding: 0.55rem 0.9rem;
		background: var(--card-alt);
		border-bottom: 1px solid var(--border);
		white-space: nowrap;
	}

	.sui-table :global(td) {
		padding: 0.6rem 0.9rem;
		border-top: 1px solid var(--border);
		vertical-align: middle;
	}

	.sui-table :global(tbody tr:first-child td) {
		border-top: 0;
	}

	.sui-table :global(tbody tr:hover td) {
		background: var(--card-alt);
	}

	.sui-table :global(.num) {
		text-align: right;
	}

	.sui-table :global(tr:last-child td) {
		border-bottom: none;
	}
</style>
