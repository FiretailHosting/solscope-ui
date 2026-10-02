<script lang="ts" module>
	import type { IconName } from '../../icons/icons.js';

	export type TabBarItem = {
		href: string;
		/** One word; the bar has no room for more. */
		label: string;
		icon: IconName;
		/** Marks the item for the page shown, with aria-current. */
		active?: boolean;
		/** An unread count, shown as a badge and read out. */
		badge?: number;
	};
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		items,
		label = 'Main pages',
		moreLabel = 'More',
		moreIcon = 'more',
		moreBadge = 0,
		moreOpen = false,
		onmore,
		class: extraClass = ''
	}: {
		/** The main destinations: four or five fit; the drawer holds the rest. */
		items: TabBarItem[];
		/** Accessible name of the navigation landmark, distinct from the sidebar's. */
		label?: string;
		/** Label of the More item, which opens the drawer; rendered only when `onmore` is set. */
		moreLabel?: string;
		moreIcon?: IconName;
		/** A count carried over from items that live in the drawer, such as the Inbox. */
		moreBadge?: number;
		/** Whether the drawer is open, for aria-expanded on the More item. */
		moreOpen?: boolean;
		/** Opens the drawer; the Sidebar's `open` is the app's to set. */
		onmore?: () => void;
		class?: string;
	} = $props();
</script>

<!-- The count is read after the label, so an item is "Bots, 2 unread". -->
{#snippet badge(count: number)}
	{#if count > 0}
		<span class="badge" aria-hidden="true">{count > 99 ? '99+' : count}</span>
	{/if}
{/snippet}

{#snippet unread(count: number)}
	{#if count > 0}
		<span class="visually-hidden">, {count} unread</span>
	{/if}
{/snippet}

<nav class="sui-tab-bar {extraClass}" aria-label={label}>
	{#each items as item (item.href)}
		<a href={item.href} class="item" class:active={item.active} aria-current={item.active ? 'page' : undefined}>
			<span class="glyph">
				<Icon name={item.icon} size={22} />
				{@render badge(item.badge ?? 0)}
			</span>
			<span class="label">{item.label}</span>
			{@render unread(item.badge ?? 0)}
		</a>
	{/each}
	{#if onmore}
		<button type="button" class="item" aria-expanded={moreOpen} onclick={onmore}>
			<span class="glyph">
				<Icon name={moreIcon} size={22} />
				{@render badge(moreBadge)}
			</span>
			<span class="label">{moreLabel}</span>
			{@render unread(moreBadge)}
		</button>
	{/if}
</nav>

<style>
	/* Narrow screens only; on wide ones the sidebar is always in view. */
	.sui-tab-bar {
		display: none;
	}

	@media (max-width: 860px) {
		.sui-tab-bar {
			display: flex;
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			/* Under the drawer and its overlay, over the page. */
			z-index: 30;
			height: calc(var(--tab-bar-height) + env(safe-area-inset-bottom));
			padding: 0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
			background: var(--card);
			border-top: 1px solid var(--border);
			overscroll-behavior: contain;
		}
	}

	.item {
		flex: 1 1 0;
		min-width: 0;
		min-height: 44px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.15rem;
		padding: 0.25rem 0.2rem;
		margin: 0;
		border: 0;
		background: none;
		font: inherit;
		font-size: 0.68rem;
		font-weight: 500;
		line-height: 1.2;
		color: var(--muted);
		text-decoration: none;
		cursor: pointer;
		transition: color 100ms, background 100ms;
	}

	.item.active {
		color: var(--accent);
		font-weight: 600;
	}

	.item:hover {
		color: var(--fg);
	}

	/* A pressed state where there is no hover, so a tap gives feedback. */
	@media (hover: none) {
		.item:active {
			background: var(--card-alt);
		}
	}

	.item:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}

	.glyph {
		position: relative;
		display: inline-flex;
	}

	.label {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.badge {
		position: absolute;
		top: -0.3rem;
		left: calc(100% - 0.5rem);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.1rem;
		height: 1.1rem;
		padding: 0 0.25rem;
		border-radius: var(--radius-sm);
		background: var(--down);
		color: var(--down-fg);
		font-size: 0.62rem;
		font-weight: 700;
		line-height: 1;
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
