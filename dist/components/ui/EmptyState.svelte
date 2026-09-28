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
		gap: 0.4rem;
		padding: 1.75rem 1rem;
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
		margin-bottom: 0.3rem;
	}

	strong {
		font-size: 0.95rem;
	}

	p {
		margin: 0;
		max-width: 26rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.actions {
		margin-top: 0.6rem;
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
