<script lang="ts" module>
	import type { IconName } from '../../icons/icons.js';

	export type TabBarItem = {
		href: string;
		/** One word; the bar has room for two short lines at most. */
		label: string;
		icon: IconName;
		/**
		 * Marks the item for the page shown, with the active look and
		 * aria-current: `true` or `'page'` when the item is that exact page,
		 * `'section'` when the page lives inside the item's section, such as
		 * one market under Markets, which is `aria-current="true"`.
		 */
		active?: boolean | 'page' | 'section';
		/** An unread count, shown as a badge and read out. */
		badge?: number;
	};

	function currentOf(active: TabBarItem['active']): 'page' | 'true' | undefined {
		if (!active) return undefined;
		return active === 'section' ? 'true' : 'page';
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		items,
		label = 'Main pages',
		moreLabel = 'More',
		moreIcon = 'more',
		moreBadge = 0,
		moreOpen = false,
		moreActive = false,
		moreControls,
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
		/**
		 * Gives More the active look when the page shown is not one of the items.
		 * It is a menu button, not the page, so it carries no aria-current: the
		 * drawer's own item marks the page.
		 */
		moreActive?: boolean;
		/** The id of the drawer More opens, for aria-controls. */
		moreControls?: string;
		/** Opens the drawer; the Sidebar's `open` is the app's to set. */
		onmore?: () => void;
		class?: string;
	} = $props();

	let bar = $state<HTMLElement>();

	// Labels wrap to two lines under large text or zoom, which makes the bar
	// taller than the --tab-bar-height token. The measured height goes on
	// <html> as --tab-bar-height, so the page padding and the Toast anchor
	// that read it follow; the bar's own min-height reads the token's floor,
	// --tab-bar-min-height, so it can shrink again. Off the phone query the
	// bar is not displayed and measures 0, and the token's default stands.
	onMount(() => {
		const root = document.documentElement;
		const observer = new ResizeObserver(() => {
			if (!bar) return;
			if (bar.offsetHeight === 0) {
				root.style.removeProperty('--tab-bar-height');
				return;
			}
			// The bar pads itself for the home indicator; consumers add that themselves.
			const inset = parseFloat(getComputedStyle(bar).paddingBottom) || 0;
			root.style.setProperty('--tab-bar-height', `${bar.offsetHeight - inset}px`);
		});
		observer.observe(bar!);
		return () => {
			observer.disconnect();
			root.style.removeProperty('--tab-bar-height');
		};
	});
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

<!-- Unkeyed: two items may share an href, such as a home and a Dashboard. -->
<nav bind:this={bar} class="sui-tab-bar {extraClass}" aria-label={label}>
	{#each items as item}
		<a href={item.href} class="item" class:active={!!item.active} aria-current={currentOf(item.active)}>
			<span class="glyph">
				<Icon name={item.icon} size={22} />
				{@render badge(item.badge ?? 0)}
			</span>
			<span class="label">{item.label}</span>
			{@render unread(item.badge ?? 0)}
		</a>
	{/each}
	{#if onmore}
		<button
			type="button"
			class="item"
			class:active={moreActive}
			aria-expanded={moreOpen}
			aria-controls={moreControls}
			onclick={onmore}
		>
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
	/* Phones only: a narrow screen with a touch pointer, PHONE_QUERY. On a
	   wide screen the sidebar is always in view; a narrow window with a mouse
	   keeps the desktop layout and the drawer. */
	.sui-tab-bar {
		display: none;
	}

	@media (max-width: 860px) and (pointer: coarse) {
		.sui-tab-bar {
			display: flex;
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			/* Under the drawer and its overlay, over the page. */
			z-index: 30;
			/* A floor, not a height: wrapped labels make the bar taller. */
			min-height: calc(var(--tab-bar-min-height) + env(safe-area-inset-bottom));
			padding: 0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
			background: var(--card);
			border-top: 1px solid var(--border);
			overscroll-behavior: contain;
		}
	}

	.item {
		position: relative;
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
		/* 12px: a label stays readable at the bottom of a phone; no smaller. */
		font-size: 0.75rem;
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

	/* A bar at the top edge, so the page shown is told apart by shape as
	   well as by colour and weight. */
	.item.active::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		width: 2.25rem;
		height: 3px;
		transform: translateX(-50%);
		background: var(--accent);
		border-radius: 0 0 var(--radius-sm) var(--radius-sm);
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

	/* Up to two lines under large text or zoom, rather than an ellipsis
	   that hides the word; the bar grows with it. */
	.label {
		max-width: 100%;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: anywhere;
		text-align: center;
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
