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
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.title-area {
		min-width: 0;
	}

	h1 {
		margin: 0;
		font-size: 1.35rem;
		letter-spacing: -0.015em;
		font-weight: 650;
	}

	.subtitle {
		margin: 0.2rem 0 0;
		font-size: 0.875rem;
		color: var(--muted);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}
</style>
