<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		href = '',
		active = false,
		badge = 0,
		class: extraClass = '',
		icon,
		children
	}: {
		href?: string;
		active?: boolean;
		badge?: number;
		class?: string;
		icon?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<a {href} class="nav-item {extraClass}" class:active aria-current={active ? 'page' : undefined}>
	{#if icon}
		<span class="icon">
			{@render icon()}
		</span>
	{/if}
	<span class="label">
		{@render children?.()}
	</span>
	{#if badge > 0}
		<span class="badge">{badge}</span>
	{/if}
</a>

<style>
	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius);
		text-decoration: none;
		font-size: 0.875rem;
		color: var(--sidebar-fg);
		font-weight: 450;
		transition: background 120ms, color 120ms;
		position: relative;
	}

	.nav-item:hover {
		background: var(--sidebar-hover-bg);
		color: var(--fg);
	}

	.nav-item.active {
		background: var(--sidebar-active-bg);
		color: var(--sidebar-active-fg);
		font-weight: 550;
	}

	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.1rem;
		height: 1.1rem;
		flex-shrink: 0;
		opacity: 0.8;
	}

	.nav-item.active .icon {
		opacity: 1;
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
		min-width: 1.15rem;
		height: 1.15rem;
		padding: 0 0.3rem;
		border-radius: var(--radius-full);
		background: var(--down);
		color: #fff;
		font-size: 0.68rem;
		font-weight: 600;
		line-height: 1;
	}
</style>
