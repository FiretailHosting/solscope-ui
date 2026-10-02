<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import type { IconName } from '../../icons/icons.js';

	let {
		href = '',
		active = false,
		badge = 0,
		icon,
		class: extraClass = '',
		onclick,
		children
	}: {
		href?: string;
		active?: boolean;
		badge?: number;
		icon?: IconName;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	} = $props();
</script>

<a {href} class="sui-nav-item {extraClass}" class:active aria-current={active ? 'page' : undefined} {onclick}>
	{#if icon}<Icon name={icon} size={17} />{/if}
	<span class="label">
		{@render children?.()}
	</span>
	{#if badge > 0}
		<span class="badge"><span aria-hidden="true">{badge > 99 ? '99+' : badge}</span><span class="visually-hidden">, {badge} unread</span></span>
	{/if}
</a>

<style>
	.sui-nav-item {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.55rem 1rem;
		border-left: 3px solid transparent;
		text-decoration: none;
		font-size: 0.875rem;
		color: var(--sidebar-fg);
		transition: background 100ms, color 100ms;
	}

	.sui-nav-item:hover {
		background: var(--sidebar-hover-bg);
		color: var(--sidebar-active-fg);
	}

	/* A pressed state where there is no hover, so a tap gives feedback. */
	@media (hover: none) {
		.sui-nav-item:active {
			background: var(--sidebar-hover-bg);
			color: var(--sidebar-active-fg);
		}
	}

	.sui-nav-item:focus-visible {
		outline: 2px solid var(--sidebar-active-bar);
		outline-offset: -2px;
	}

	.sui-nav-item.active {
		background: var(--sidebar-active-bg);
		color: var(--sidebar-active-fg);
		border-left-color: var(--sidebar-active-bar);
		font-weight: 600;
	}

	/* Easier to tap on touch screens; desktop sizes stay as they are. */
	@media (pointer: coarse) {
		.sui-nav-item {
			min-height: 44px;
		}
	}

	.sui-nav-item :global(.icon) {
		opacity: 0.85;
	}

	.sui-nav-item.active :global(.icon) {
		opacity: 1;
		color: var(--sidebar-active-bar);
	}

	.label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.1rem;
		padding: 0 0.3rem;
		border-radius: var(--radius-sm);
		background: var(--down);
		color: var(--down-fg);
		font-size: 0.68rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
