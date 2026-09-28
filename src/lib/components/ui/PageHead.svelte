<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title = '',
		class: extraClass = '',
		actions,
		children
	}: {
		title?: string;
		class?: string;
		actions?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<div class="page-head {extraClass}">
	<div class="title-area">
		{#if title}
			<h1>{title}</h1>
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
	.page-head {
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
		font-size: 1.5rem;
		letter-spacing: -0.025em;
		font-weight: 700;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}
</style>
