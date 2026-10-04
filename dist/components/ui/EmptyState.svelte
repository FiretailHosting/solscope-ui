<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import type { IconName } from '../../icons/icons.js';

	let {
		icon = 'spark',
		title,
		text = '',
		class: extraClass = '',
		children
	}: {
		icon?: IconName;
		title: string;
		text?: string;
		class?: string;
		/** Actions, such as a button to create the first item. */
		children?: Snippet;
	} = $props();
</script>

<div class="sui-empty {extraClass}">
	<span class="mark"><Icon name={icon} size={22} /></span>
	<strong>{title}</strong>
	{#if text}<p>{text}</p>{/if}
	{#if children}<div class="actions">{@render children()}</div>{/if}
</div>

<style>
	.sui-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-1-5);
		padding: var(--space-7) var(--space-4);
	}

	.mark {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.6rem;
		height: 2.6rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--accent);
		background: var(--accent-subtle);
		margin-bottom: var(--space-1);
	}

	strong {
		font-size: var(--text-md);
	}

	p {
		margin: 0;
		max-width: 26rem;
		font-size: var(--text-sm);
		color: var(--muted);
	}

	.actions {
		margin-top: var(--space-2-5);
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
