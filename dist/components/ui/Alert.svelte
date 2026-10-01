<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { IconName } from '../../icons/icons.js';
	import Icon from './Icon.svelte';

	type Variant = 'default' | 'error' | 'up' | 'warn';

	let {
		variant = 'default',
		icon,
		role,
		class: extraClass = '',
		children
	}: {
		variant?: Variant;
		/**
		 * Shows an icon before the text, so the variant does not rest on colour
		 * alone. true picks one for the variant; an icon name picks that icon.
		 */
		icon?: boolean | IconName;
		/**
		 * Defaults to alert for errors, which screen readers announce at once,
		 * and status for everything else, which waits its turn.
		 */
		role?: string;
		class?: string;
		children?: Snippet;
	} = $props();

	const defaultIconForVariant: Record<Variant, IconName> = {
		default: 'spark',
		error: 'alert',
		warn: 'alert',
		up: 'check'
	};

	const resolvedRole = $derived(role ?? (variant === 'error' ? 'alert' : 'status'));
	const resolvedIcon = $derived(icon === true ? defaultIconForVariant[variant] : icon || undefined);
</script>

<div role={resolvedRole} class="sui-alert {variant} {extraClass}" class:with-icon={resolvedIcon}>
	{#if resolvedIcon}
		<Icon name={resolvedIcon} size={16} class="sui-alert-icon" />
		<div class="sui-alert-body">{@render children?.()}</div>
	{:else}
		{@render children?.()}
	{/if}
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

	.sui-alert.with-icon {
		display: flex;
		align-items: flex-start;
		gap: 0.55rem;
	}

	/* Centred on the first line of text, however many lines follow. */
	.sui-alert :global(.sui-alert-icon) {
		margin-top: 0.125rem;
		margin-top: calc((1lh - 16px) / 2);
	}

	.sui-alert-body {
		flex: 1;
		min-width: 0;
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
