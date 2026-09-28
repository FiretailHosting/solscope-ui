<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		cols = 2,
		minWidth = '15rem',
		class: extraClass = '',
		children
	}: {
		cols?: number;
		minWidth?: string;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="sui-grid {extraClass}" style="--min-w: {minWidth}; --cols: {cols}">
	{@render children?.()}
</div>

<style>
	.sui-grid {
		display: grid;
		grid-template-columns: repeat(var(--cols, 2), minmax(var(--min-w, 15rem), 1fr));
		gap: 1rem;
	}

	@media (max-width: 640px) {
		.sui-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
