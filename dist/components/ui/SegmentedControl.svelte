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

<div class="sui-segmented {extraClass}" role="group" aria-label={label}>
	{@render children?.()}
</div>

<style>
	.sui-segmented {
		display: inline-flex;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		overflow: hidden;
		background: var(--card);
	}

	/* Children are plain <button> elements with class:active */
	.sui-segmented :global(button) {
		font: inherit;
		font-size: 0.82rem;
		padding: 0.3rem 0.8rem;
		border: 0;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		transition: color 120ms, background 120ms, box-shadow 120ms;
	}

	.sui-segmented :global(button + button) {
		border-left: 1px solid var(--border-strong);
	}

	.sui-segmented :global(button.active) {
		color: var(--accent-fg);
		background: var(--accent);
		font-weight: 600;
	}

	.sui-segmented :global(button:hover:not(.active):not(:disabled)) {
		color: var(--fg);
	}

	.sui-segmented :global(button:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}

	.sui-segmented :global(button:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
