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
		/**
		 * Shows a spinner and blocks clicks while an action runs. The spinner
		 * takes the icon's place, or covers the label when there is no icon,
		 * so the button keeps its width.
		 */
		loading?: boolean;
		children?: Snippet;
	}

	let {
		variant = 'default',
		size = 'default',
		href,
		icon,
		loading = false,
		disabled,
		class: extraClass = '',
		children,
		...rest
	}: Props = $props();

	const iconSize = $derived(size === 'sm' ? 14 : 16);
	// Without an icon to replace, the spinner sits over the hidden label.
	const spinnerCoversLabel = $derived(loading && !icon && !!children);
</script>

{#snippet content()}
	{#if loading}
		<svg
			class="sui-btn-spinner"
			class:covers-label={spinnerCoversLabel}
			width={iconSize}
			height={iconSize}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			stroke-linecap="square"
			aria-hidden="true"
			focusable="false"
		>
			<path d="M12 3a9 9 0 1 1-9 9" />
			<circle cx="12" cy="3" r="1.35" fill="currentColor" stroke="none" />
		</svg>
	{:else if icon}
		<Icon name={icon} size={iconSize} />
	{/if}
	{#if spinnerCoversLabel}
		<!-- Transparent, not hidden, so screen readers still read the label. -->
		<span class="label-under-spinner">{@render children?.()}</span>
	{:else}
		{@render children?.()}
	{/if}
{/snippet}

{#if href}
	<!-- A link cannot be disabled, so a loading one drops its href instead. -->
	<a
		href={loading ? undefined : href}
		class="sui-btn {variant} {size} {extraClass}"
		class:loading
		class:spinner-covers-label={spinnerCoversLabel}
		{...rest as HTMLAnchorAttributes}
		aria-disabled={loading || rest['aria-disabled']}
		aria-busy={loading || rest['aria-busy']}
	>
		{@render content()}
	</a>
{:else}
	<button
		class="sui-btn {variant} {size} {extraClass}"
		class:loading
		class:spinner-covers-label={spinnerCoversLabel}
		{...rest}
		disabled={disabled || loading}
		aria-busy={loading || rest['aria-busy']}
	>
		{@render content()}
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

	/* Cannot act right now but still focusable and tappable, so that pressing
	   it can say why: grey text and border, with the same look under the
	   pointer. The muted text keeps about 5:1 contrast in both themes. */
	.sui-btn[aria-disabled='true'],
	.sui-btn[aria-disabled='true']:hover:not(:disabled) {
		color: var(--muted);
		background: var(--card);
		border-color: var(--border);
	}

	.sui-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	/* Loading */
	.sui-btn.loading {
		cursor: progress;
	}

	a.sui-btn.loading {
		opacity: 0.5;
		pointer-events: none;
	}

	.sui-btn.spinner-covers-label {
		position: relative;
	}

	.label-under-spinner {
		opacity: 0;
	}

	.sui-btn-spinner {
		flex-shrink: 0;
		animation: sui-btn-spin 0.8s linear infinite;
	}

	.sui-btn-spinner.covers-label {
		position: absolute;
		inset: 0;
		margin: auto;
	}

	@keyframes sui-btn-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sui-btn-spinner {
			animation: none;
		}
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

	/* Easier to tap on touch screens; desktop sizes stay as they are. */
	@media (pointer: coarse) {
		.sui-btn {
			min-height: 44px;
		}
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

	.sui-btn.primary[aria-disabled='true'],
	.sui-btn.primary[aria-disabled='true']:hover:not(:disabled) {
		color: var(--accent-fg);
		background: var(--muted);
		border-color: var(--muted);
	}

	.sui-btn.danger {
		color: var(--down);
	}

	.sui-btn.danger:hover:not(:disabled) {
		border-color: var(--down);
		background: var(--down-subtle);
	}

	.sui-btn.danger[aria-disabled='true'],
	.sui-btn.danger[aria-disabled='true']:hover:not(:disabled) {
		color: var(--muted);
		background: var(--card);
		border-color: var(--border);
	}

	.sui-btn.ghost {
		border-color: transparent;
		background: transparent;
	}

	.sui-btn.ghost:hover:not(:disabled) {
		background: var(--card-alt);
		border-color: var(--border);
	}

	.sui-btn.ghost[aria-disabled='true'],
	.sui-btn.ghost[aria-disabled='true']:hover:not(:disabled) {
		color: var(--muted);
		background: transparent;
		border-color: transparent;
	}
</style>
