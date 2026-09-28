<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'error' | 'up' | 'warn';

	let {
		variant = 'default',
		role = 'alert',
		class: extraClass = '',
		children
	}: {
		variant?: Variant;
		role?: string;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<p {role} class="sui-alert {variant} {extraClass}">
	{@render children?.()}
</p>

<style>
	.sui-alert {
		font-size: 0.88rem;
		padding: 0.65rem 0.9rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--card);
		margin: 0;
	}

	.sui-alert.error {
		border-color: var(--down);
		color: var(--down);
		background: var(--down-subtle);
	}

	.sui-alert.warn {
		border-color: var(--warn);
		color: var(--warn);
		background: var(--warn-subtle);
	}

	.sui-alert.up {
		border-color: var(--up);
		color: var(--up);
		background: var(--up-subtle);
	}
</style>
