<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';
	import type { IconName } from '../../icons/icons.js';

	type Variant = 'default' | 'primary' | 'danger' | 'ghost';
	type Size = 'default' | 'sm' | 'lg';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		/** Renders a link styled as a button. */
		href?: string;
		/** Icon before the label. */
		icon?: IconName;
		children?: Snippet;
	}

	let {
		variant = 'default',
		size = 'default',
		href,
		icon,
		class: extraClass = '',
		children,
		...rest
	}: Props = $props();

	const iconSize = $derived(size === 'sm' ? 14 : 16);
</script>

{#if href}
	<a {href} class="sui-btn {variant} {size} {extraClass}" {...rest as HTMLAnchorAttributes}>
		{#if icon}<Icon name={icon} size={iconSize} />{/if}
		{@render children?.()}
	</a>
{:else}
	<button class="sui-btn {variant} {size} {extraClass}" {...rest}>
		{#if icon}<Icon name={icon} size={iconSize} />{/if}
		{@render children?.()}
	</button>
{/if}

<style>
	.sui-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		font: inherit;
		font-weight: 500;
		cursor: pointer;
		border-radius: var(--radius);
		border: 1px solid var(--border-strong);
		background: var(--card);
		color: var(--fg);
		text-decoration: none;
		white-space: nowrap;
		transition: border-color 100ms, background 100ms, color 100ms;
	}

	.sui-btn:hover:not(:disabled) {
		background: var(--card-alt);
		border-color: var(--muted);
	}

	.sui-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.sui-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	/* Sizes */
	.default {
		font-size: 0.875rem;
		padding: 0.45rem 0.9rem;
	}

	.sm {
		font-size: 0.78rem;
		padding: 0.25rem 0.6rem;
	}

	.lg {
		font-size: 0.95rem;
		padding: 0.6rem 1.2rem;
	}

	/* Variants */
	.sui-btn.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-fg);
	}

	.sui-btn.primary:hover:not(:disabled) {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}

	.sui-btn.danger {
		color: var(--down);
	}

	.sui-btn.danger:hover:not(:disabled) {
		border-color: var(--down);
		background: var(--down-subtle);
	}

	.sui-btn.ghost {
		border-color: transparent;
		background: transparent;
	}

	.sui-btn.ghost:hover:not(:disabled) {
		background: var(--card-alt);
		border-color: var(--border);
	}
</style>
