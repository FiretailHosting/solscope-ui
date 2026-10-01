<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'error' | 'up' | 'warn';

	let {
		variant = 'default',
		role,
		class: extraClass = '',
		children
	}: {
		variant?: Variant;
		/**
		 * Defaults to alert for errors, which screen readers announce at once,
		 * and status for everything else, which waits its turn.
		 */
		role?: string;
		class?: string;
		children?: Snippet;
	} = $props();

	const resolvedRole = $derived(role ?? (variant === 'error' ? 'alert' : 'status'));
</script>

<div role={resolvedRole} class="sui-alert {variant} {extraClass}">
	{@render children?.()}
</div>

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
