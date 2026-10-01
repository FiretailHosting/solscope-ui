<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label = '',
		hint = '',
		error = '',
		class: extraClass = '',
		children
	}: {
		label?: string;
		hint?: string;
		/** Shown in place of the hint. Also set aria-invalid on the input. */
		error?: string;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<!-- A label wrapping the input names it, and clicking the text focuses it. -->
<label class="sui-field {extraClass}">
	{#if label}
		<span class="field-label">{label}</span>
	{/if}
	{@render children?.()}
	{#if error}
		<small class="error" role="alert">{error}</small>
	{:else if hint}
		<small class="hint">{hint}</small>
	{/if}
</label>

<style>
	.sui-field {
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

	.hint,
	.error {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.error {
		color: var(--down);
	}
</style>
