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

<span class="pill {variant} {extraClass}">
	{@render children?.()}
</span>

<style>
	.pill {
		display: inline-block;
		font-size: 0.72rem;
		font-weight: 500;
		padding: 0.1rem 0.55rem;
		border-radius: var(--radius-full);
		border: 1px solid var(--border);
		color: var(--muted);
		white-space: nowrap;
	}

	.pill.live {
		color: var(--down);
		border-color: var(--down);
		background: var(--down-subtle);
	}

	.pill.ok {
		color: var(--up);
		border-color: var(--up);
		background: var(--up-subtle);
	}
</style>
