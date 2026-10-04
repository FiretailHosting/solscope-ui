<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import type { IconName } from '../../icons/icons.js';

	let {
		title = '',
		icon,
		flush = false,
		class: extraClass = '',
		actions,
		children
	}: {
		/** Header title. With no title and no actions there is no header. */
		title?: string;
		icon?: IconName;
		/** Drop the body padding, for tables and lists that run edge to edge. */
		flush?: boolean;
		class?: string;
		actions?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<section class="sui-card {extraClass}">
	{#if title || actions}
		<header>
			{#if title}
				<h2>
					{#if icon}<Icon name={icon} size={16} />{/if}
					{title}
				</h2>
			{/if}
			{#if actions}
				<div class="actions">{@render actions()}</div>
			{/if}
		</header>
	{/if}
	<div class="body" class:flush>
		{@render children?.()}
	</div>
</section>

<style>
	.sui-card {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		min-width: 0;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--border);
	}

	h2 {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		font-size: var(--text-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
	}

	h2 :global(.icon) {
		color: var(--accent);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.body {
		padding: var(--space-4) var(--space-4);
	}

	.body.flush {
		padding: 0;
	}
</style>
