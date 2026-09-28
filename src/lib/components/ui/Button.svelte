<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'default' | 'primary' | 'danger' | 'ghost';
	type Size = 'default' | 'sm' | 'lg';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		children?: Snippet;
	}

	let {
		variant = 'default',
		size = 'default',
		class: extraClass = '',
		children,
		...rest
	}: Props = $props();
</script>

<button class="btn {variant} {size} {extraClass}" {...rest}>
	{@render children?.()}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		font: inherit;
		cursor: pointer;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--card);
		color: var(--fg);
		text-decoration: none;
		white-space: nowrap;
		transition: border-color 120ms, background 120ms, color 120ms, opacity 120ms;
	}

	.btn:hover:not(:disabled) {
		border-color: var(--accent);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	/* Sizes */
	.default {
		font-size: 0.9rem;
		padding: 0.45rem 0.95rem;
	}

	.sm {
		font-size: 0.78rem;
		padding: 0.25rem 0.65rem;
	}

	.lg {
		font-size: 1rem;
		padding: 0.65rem 1.25rem;
	}

	/* Variants */
	.btn.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}

	.btn.primary:hover:not(:disabled) {
		background: var(--accent);
		border-color: var(--accent);
		opacity: 0.88;
	}

	.btn.danger {
		color: var(--down);
		border-color: var(--border);
	}

	.btn.danger:hover:not(:disabled) {
		border-color: var(--down);
		background: var(--down-subtle);
	}

	.btn.ghost {
		border-color: transparent;
		background: transparent;
	}

	.btn.ghost:hover:not(:disabled) {
		background: var(--card);
		border-color: var(--border);
	}
</style>
