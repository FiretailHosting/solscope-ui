<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(true),
		class: extraClass = '',
		header,
		children,
		footer
	}: {
		open?: boolean;
		class?: string;
		header?: Snippet;
		children?: Snippet;
		footer?: Snippet;
	} = $props();
</script>

<!-- Mobile overlay -->
{#if !open}
	<div class="overlay" role="none" onclick={() => (open = false)}></div>
{/if}

<aside class="sidebar {extraClass}" class:collapsed={!open} aria-label="Navigation">
	{#if header}
		<div class="sidebar-header">
			{@render header()}
		</div>
	{/if}

	<nav class="sidebar-nav">
		{@render children?.()}
	</nav>

	{#if footer}
		<div class="sidebar-footer">
			{@render footer()}
		</div>
	{/if}
</aside>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		width: 220px;
		min-width: 220px;
		height: 100dvh;
		position: sticky;
		top: 0;
		background: var(--sidebar-bg);
		border-right: 1px solid var(--sidebar-border);
		overflow-y: auto;
		overflow-x: hidden;
		flex-shrink: 0;
		transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1),
					width 280ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.sidebar-header {
		padding: 1.1rem 1rem 0.5rem;
		flex-shrink: 0;
	}

	.sidebar-nav {
		flex: 1;
		padding: 0.5rem 0.6rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.sidebar-footer {
		padding: 0.75rem 0.6rem;
		border-top: 1px solid var(--sidebar-border);
		flex-shrink: 0;
	}

	/* Mobile: sidebar slides in from left */
	@media (max-width: 768px) {
		.sidebar {
			position: fixed;
			left: 0;
			top: 0;
			z-index: 50;
			box-shadow: 4px 0 24px rgba(0, 0, 0, 0.18);
		}

		.sidebar.collapsed {
			transform: translateX(-100%);
		}
	}

	.overlay {
		display: none;
	}

	@media (max-width: 768px) {
		.overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.45);
			z-index: 40;
			backdrop-filter: blur(2px);
		}
	}
</style>
