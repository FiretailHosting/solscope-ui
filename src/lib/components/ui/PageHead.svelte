<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title = '',
		subtitle = '',
		class: extraClass = '',
		actions,
		children
	}: {
		title?: string;
		subtitle?: string;
		class?: string;
		actions?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<div class="sui-page-head {extraClass}">
	<div class="title-area">
		{#if title}
			<h1>{title}</h1>
		{/if}
		{#if subtitle}
			<p class="subtitle">{subtitle}</p>
		{/if}
		{@render children?.()}
	</div>
	{#if actions}
		<div class="actions">
			{@render actions()}
		</div>
	{/if}
</div>

<style>
	.sui-page-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-5);
	}

	.title-area {
		min-width: 0;
	}

	h1 {
		margin: 0;
		font-size: var(--text-xl);
		letter-spacing: -0.015em;
		font-weight: 650;
	}

	.subtitle {
		margin: var(--space-1) 0 0;
		font-size: var(--text-sm);
		color: var(--muted);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}
</style>
