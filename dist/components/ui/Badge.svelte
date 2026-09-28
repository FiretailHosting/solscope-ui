<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'up' | 'down' | 'accent';

	let {
		variant = 'default',
		class: extraClass = '',
		children
	}: {
		variant?: Variant;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<span class="sui-badge {variant} {extraClass}">
	{@render children?.()}
</span>

<style>
	.sui-badge {
		display: inline-flex;
		align-items: center;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		padding: 0.15rem 0.55rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		color: var(--muted);
		white-space: nowrap;
		line-height: 1.4;
	}

	.sui-badge.up {
		color: var(--up);
		border-color: var(--up);
		background: var(--up-subtle);
	}

	.sui-badge.down {
		color: var(--down);
		border-color: var(--down);
		background: var(--down-subtle);
	}

	.sui-badge.accent {
		color: var(--accent);
		border-color: var(--accent);
		background: var(--accent-subtle);
	}
</style>
