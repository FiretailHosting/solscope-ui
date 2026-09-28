<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label = '',
		hint = '',
		class: extraClass = '',
		children
	}: {
		label?: string;
		hint?: string;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="field {extraClass}">
	{#if label}
		<span class="field-label">{label}</span>
	{/if}
	{@render children?.()}
	{#if hint}
		<small class="hint">{hint}</small>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		margin-bottom: 0.85rem;
	}

	.field-label {
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--muted);
	}

	.hint {
		font-size: 0.75rem;
		color: var(--muted);
	}
</style>
