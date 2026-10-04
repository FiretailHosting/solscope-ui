<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import { lockScroll } from '../../scroll-lock.js';

	let {
		open = $bindable(false),
		id,
		closeLabel = 'Close menu',
		class: extraClass = '',
		header,
		children,
		footer
	}: {
		/** Whether the sidebar is shown on narrow screens. It is always shown on wide ones. */
		open?: boolean;
		/** The aside's id, for the menu button's aria-controls. */
		id?: string;
		/** Accessible name of the close button shown in the drawer on narrow screens. */
		closeLabel?: string;
		class?: string;
		header?: Snippet;
		children?: Snippet;
		footer?: Snippet;
	} = $props();

	let closeButton = $state<HTMLButtonElement>();
	let sidebar = $state<HTMLElement>();
	let overlay = $state<HTMLElement>();

	// The width under which the sidebar is a drawer; the same number as the
	// media queries below.
	const drawerQuery = '(max-width: 860px)';

	// Everything outside the drawer and its overlay is inert while the drawer
	// covers the page, from the drawer's siblings up to the body's children,
	// so a swipe or a screen reader cannot reach the page behind it. Returns
	// the function that lifts it.
	function inertOutside(kept: Element[]): () => void {
		const changed: Element[] = [];
		for (let node: Element | null = kept[0]; node && node !== document.body; node = node.parentElement) {
			for (const sibling of node.parentElement?.children ?? []) {
				if (sibling === node || kept.includes(sibling) || sibling.hasAttribute('inert')) continue;
				sibling.setAttribute('inert', '');
				changed.push(sibling);
			}
		}
		return () => changed.forEach((element) => element.removeAttribute('inert'));
	}

	// Escape inside a modal dialog closes that dialog, not the drawer under it.
	function closeOnEscape(event: KeyboardEvent) {
		if (!open || event.key !== 'Escape') return;
		if (event.target instanceof Element && event.target.closest('dialog[open]')) return;
		open = false;
	}

	// Open as a drawer, the page behind must not scroll under a touch, and
	// focus moves in to the close button and back out to whatever opened it.
	// The drawer only opens on narrow screens, where it covers the page; the
	// page is inert only while the screen is narrow, so an `open` left true
	// on a widened window does not block it.
	$effect(() => {
		if (!open || !sidebar) return;
		const drawer = sidebar;
		const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const unlock = lockScroll();
		closeButton?.focus();
		const narrow = window.matchMedia(drawerQuery);
		let liftInert = () => {};
		const follow = () => {
			liftInert();
			liftInert = narrow.matches ? inertOutside([drawer, overlay].filter((element): element is HTMLElement => !!element)) : () => {};
		};
		follow();
		narrow.addEventListener('change', follow);
		return () => {
			narrow.removeEventListener('change', follow);
			liftInert();
			unlock();
			// Focus still inside the drawer, or lost to the page, goes back to the opener.
			const focused = document.activeElement;
			if (opener && (!focused || focused === document.body || sidebar?.contains(focused))) {
				opener.focus();
			}
		};
	});
</script>

<svelte:window onkeydown={closeOnEscape} />

{#if open}
	<div bind:this={overlay} class="sui-overlay" role="none" onclick={() => (open = false)}></div>
{/if}

<aside bind:this={sidebar} {id} class="sui-sidebar {extraClass}" class:open aria-label="Navigation">
	<div class="sui-sidebar-header" class:has-content={!!header}>
		{#if header}
			<div class="sui-sidebar-header-content">
				{@render header()}
			</div>
		{/if}
		<button
			bind:this={closeButton}
			type="button"
			class="sui-sidebar-close"
			aria-label={closeLabel}
			onclick={() => (open = false)}
		>
			<Icon name="close" size={20} />
		</button>
	</div>

	<nav class="sui-sidebar-nav">
		{@render children?.()}
	</nav>

	{#if footer}
		<div class="sui-sidebar-footer">
			{@render footer()}
		</div>
	{/if}
</aside>

<style>
	.sui-sidebar {
		display: flex;
		flex-direction: column;
		width: 232px;
		height: 100dvh;
		position: sticky;
		top: 0;
		background: var(--sidebar-bg);
		color: var(--sidebar-fg);
		border-right: 1px solid var(--sidebar-border);
		overflow-y: auto;
		overflow-x: hidden;
		flex-shrink: 0;
	}

	.sui-sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		padding: var(--space-4) var(--space-4) var(--space-3);
		border-bottom: 1px solid var(--sidebar-border);
		flex-shrink: 0;
	}

	/* Without a header snippet the row only exists for the drawer's close
	   button, so on wide screens it takes no room. */
	.sui-sidebar-header:not(.has-content) {
		display: none;
	}

	.sui-sidebar-header-content {
		min-width: 0;
		flex: 1;
	}

	.sui-sidebar-close {
		display: none;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		margin: calc(-1 * var(--space-1)) calc(-1 * var(--space-2)) calc(-1 * var(--space-1)) 0;
		padding: 0;
		border: 1px solid transparent;
		border-radius: var(--radius);
		background: none;
		color: var(--sidebar-fg);
		cursor: pointer;
		flex-shrink: 0;
	}

	.sui-sidebar-close:hover {
		color: var(--sidebar-active-fg);
		border-color: var(--sidebar-border);
	}

	.sui-sidebar-close:focus-visible {
		outline: 2px solid var(--sidebar-active-bar);
		outline-offset: -2px;
	}

	.sui-sidebar-nav {
		flex: 1;
		padding: var(--space-2) 0;
		display: flex;
		flex-direction: column;
	}

	.sui-sidebar-footer {
		padding: var(--space-3);
		border-top: 1px solid var(--sidebar-border);
		flex-shrink: 0;
	}

	.sui-overlay {
		display: none;
	}

	/* Narrow screens: off-canvas, sliding in over a dimmed page. */
	@media (max-width: 860px) {
		.sui-sidebar {
			position: fixed;
			left: 0;
			top: 0;
			z-index: 50;
			transform: translateX(-100%);
			/* Hidden once it has slid away, so its links leave the tab order. */
			visibility: hidden;
			transition:
				transform 200ms ease-out,
				visibility 0s 200ms;
			/* The drawer's own scroll must not spill into the page behind it. */
			overscroll-behavior: contain;
		}

		.sui-sidebar.open {
			transform: none;
			visibility: visible;
			transition: transform 200ms ease-out;
		}

		.sui-sidebar-header:not(.has-content) {
			display: flex;
			justify-content: flex-end;
		}

		.sui-sidebar-close {
			display: inline-flex;
		}

		/* Clear of the status bar, the home indicator and a notch in landscape. */
		.sui-sidebar-header {
			padding-top: calc(var(--space-4) + env(safe-area-inset-top));
			padding-left: calc(var(--space-4) + env(safe-area-inset-left));
		}

		.sui-sidebar-nav {
			padding-left: env(safe-area-inset-left);
		}

		.sui-sidebar-footer {
			padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom));
			padding-left: calc(var(--space-3) + env(safe-area-inset-left));
		}

		.sui-overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(10, 14, 20, 0.5);
			z-index: 40;
		}
	}

	/* Easier to tap on touch screens; desktop sizes stay as they are. */
	@media (pointer: coarse) {
		.sui-sidebar-close {
			width: 44px;
			height: 44px;
			margin: calc(-1 * var(--space-2-5)) calc(-1 * var(--space-3)) calc(-1 * var(--space-2-5)) 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sui-sidebar {
			transition: none;
		}
	}
</style>
