<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		class: extraClass = '',
		header,
		children,
		footer
	}: {
		/** Whether the sidebar is shown on narrow screens. It is always shown on wide ones. */
		open?: boolean;
		class?: string;
		header?: Snippet;
		children?: Snippet;
		footer?: Snippet;
	} = $props();
</script>

{#if open}
	<div class="sui-overlay" role="none" onclick={() => (open = false)}></div>
{/if}

<aside class="sui-sidebar {extraClass}" class:open aria-label="Navigation">
	{#if header}
		<div class="sui-sidebar-header">
			{@render header()}
		</div>
	{/if}

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
		padding: 1rem 1rem 0.75rem;
		border-bottom: 1px solid var(--sidebar-border);
		flex-shrink: 0;
	}

	.sui-sidebar-nav {
		flex: 1;
		padding: 0.5rem 0;
		display: flex;
		flex-direction: column;
	}

	.sui-sidebar-footer {
		padding: 0.75rem;
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
			transition: transform 200ms ease-out;
		}

		.sui-sidebar.open {
			transform: none;
		}

		.sui-overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(10, 14, 20, 0.5);
			z-index: 40;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sui-sidebar {
			transition: none;
		}
	}
</style>
