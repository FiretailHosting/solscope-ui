<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label = '',
		class: extraClass = '',
		children
	}: {
		label?: string;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="segmented {extraClass}" role="group" aria-label={label}>
	{@render children?.()}
</div>

<style>
	.segmented {
		display: inline-flex;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		background: var(--card);
	}

	/* Children are plain <button> elements with class:active */
	.segmented :global(button) {
		font: inherit;
		font-size: 0.82rem;
		padding: 0.3rem 0.8rem;
		border: 0;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		transition: color 120ms, background 120ms, box-shadow 120ms;
	}

	.segmented :global(button + button) {
		border-left: 1px solid var(--border);
	}

	.segmented :global(button.active) {
		color: var(--fg);
		background: var(--bg);
		box-shadow: inset 0 -2px 0 var(--accent);
	}

	.segmented :global(button:hover:not(.active):not(:disabled)) {
		color: var(--fg);
	}

	.segmented :global(button:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
