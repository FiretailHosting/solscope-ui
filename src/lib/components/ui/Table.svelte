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

<div class="table-wrap">
	<table class="table {extraClass}">
		{@render children?.()}
	</table>
</div>

<style>
	.table-wrap {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.88rem;
		font-variant-numeric: tabular-nums;
	}

	.table :global(th) {
		text-align: left;
		font-weight: 500;
		color: var(--muted);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0 0.6rem 0.6rem;
	}

	.table :global(td) {
		padding: 0.6rem 0.6rem;
		border-top: 1px solid var(--border);
		vertical-align: middle;
	}

	.table :global(.num) {
		text-align: right;
	}

	.table :global(tr:last-child td) {
		border-bottom: none;
	}
</style>
