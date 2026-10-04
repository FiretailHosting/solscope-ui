<script lang="ts">
	import type { Snippet } from 'svelte';

	// A balance above an amount field: what it is, how much, and an action at
	// the end such as Max or Deposit, as a link Button.
	let {
		label,
		title,
		busy = false,
		class: extraClass = '',
		action,
		children
	}: {
		label: string;
		/** A tooltip for the value, such as its full precision. */
		title?: string;
		/** The value is loading; put a Skeleton in its place. */
		busy?: boolean;
		class?: string;
		/** Sits at the end of the row: Max, Deposit, Retry. */
		action?: Snippet;
		/** The value. */
		children?: Snippet;
	} = $props();
</script>

<div class="sui-balance {extraClass}" aria-busy={busy || undefined}>
	<span class="label">{label}</span>
	{#if children}
		<strong {title}>{@render children()}</strong>
	{/if}
	{#if action}
		<span class="action">{@render action()}</span>
	{/if}
</div>

<style>
	.sui-balance {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0 0 var(--space-3);
		padding: var(--space-2) var(--space-2-5);
		background: var(--card-alt);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font-size: var(--text-sm);
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	strong {
		margin-left: auto;
		color: var(--fg);
	}

	/* With no value, the action still sits at the end. */
	.label + .action {
		margin-left: auto;
	}

	.action {
		display: inline-flex;
		align-items: center;
	}
</style>
