<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'live' | 'ok';

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

<span class="sui-pill {variant} {extraClass}">
	{@render children?.()}
</span>

<style>
	.sui-pill {
		display: inline-block;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		padding: 0.1rem 0.55rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		color: var(--muted);
		white-space: nowrap;
	}

	.sui-pill.live {
		color: var(--down);
		border-color: var(--down);
		background: var(--down-subtle);
	}

	.sui-pill.ok {
		color: var(--up);
		border-color: var(--up);
		background: var(--up-subtle);
	}
</style>
