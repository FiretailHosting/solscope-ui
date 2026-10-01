<script lang="ts">
	import Icon from './Icon.svelte';
	import Skeleton from './Skeleton.svelte';
	import type { IconName } from '../../icons/icons.js';

	let {
		label = '',
		value = '',
		hint = '',
		tone = 'default',
		icon,
		href,
		loading = false,
		class: extraClass = ''
	}: {
		label: string;
		value: string;
		/** A second line, such as a change or a count. */
		hint?: string;
		/** Colours the hint: up for gains, down for losses. */
		tone?: 'default' | 'up' | 'down';
		icon?: IconName;
		/** Makes the whole tile a link. */
		href?: string;
		/**
		 * Shows a placeholder in place of the value while it loads, at the
		 * value's height so the tile does not move. The hint shows as given.
		 */
		loading?: boolean;
		class?: string;
	} = $props();
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	{href}
	class="sui-stat {extraClass}"
	class:link={!!href}
	aria-busy={loading || undefined}
>
	<div class="top">
		<span class="label">{label}</span>
		{#if icon}<Icon name={icon} size={16} />{/if}
	</div>
	<div class="value">
		{#if loading}<Skeleton width="6rem" height="0.8em" />{:else}{value}{/if}
	</div>
	{#if hint}
		<div class="hint {tone}">{hint}</div>
	{/if}
</svelte:element>

<style>
	.sui-stat {
		display: block;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 0.85rem 1rem;
		text-decoration: none;
		color: inherit;
		min-width: 0;
	}

	.sui-stat.link:hover {
		border-color: var(--border-strong);
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		color: var(--muted);
	}

	.top :global(.icon) {
		color: var(--accent);
	}

	.label {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 600;
	}

	.value {
		margin-top: 0.35rem;
		font-variant-numeric: tabular-nums;
		font-size: 1.4rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.hint {
		margin-top: 0.15rem;
		font-size: 0.8rem;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	.hint.up {
		color: var(--up);
	}

	.hint.down {
		color: var(--down);
	}
</style>
