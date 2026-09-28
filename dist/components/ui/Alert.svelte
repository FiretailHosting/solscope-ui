<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'error' | 'up';

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

<p {role} class="alert {variant} {extraClass}">
	{@render children?.()}
</p>

<style>
	.alert {
		font-size: 0.88rem;
		padding: 0.65rem 0.9rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--card);
		margin: 0;
	}

	.alert.error {
		border-color: var(--down);
		color: var(--down);
		background: var(--down-subtle);
	}

	.alert.up {
		border-color: var(--up);
		color: var(--up);
		background: var(--up-subtle);
	}
</style>
