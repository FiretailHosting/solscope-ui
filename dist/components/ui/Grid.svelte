<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		cols = 2,
		minWidth = '15rem',
		class: extraClass = '',
		children
	}: {
		/** The most columns; fewer when they would be narrower than minWidth. */
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
		/* At most --cols columns, each at least --min-w wide: narrower than
		   that, a column drops out, so a form in a narrow card never spills. */
		grid-template-columns: repeat(
			auto-fit,
			minmax(max(var(--min-w, 15rem), calc((100% - var(--space-4) * (var(--cols, 2) - 1)) / var(--cols, 2))), 1fr)
		);
		gap: var(--space-4);
	}

	@media (max-width: 640px) {
		.sui-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
