<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label = '',
		hint = '',
		error = '',
		errorId,
		hintId,
		class: extraClass = '',
		children
	}: {
		label?: string;
		hint?: string;
		/** Shown in place of the hint. Also set aria-invalid on the input. */
		error?: string;
		/** An id for the error, for the input's aria-describedby. */
		errorId?: string;
		/** An id for the hint, for the input's aria-describedby. */
		hintId?: string;
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
		<small class="error" id={errorId} role="alert">{error}</small>
	{:else if hint}
		<small class="hint" id={hintId}>{hint}</small>
	{/if}
</label>

<style>
	.sui-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-bottom: var(--space-3-5);
	}

	.field-label {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--muted);
	}

	.hint,
	.error {
		font-size: var(--text-xs);
		color: var(--muted);
	}

	.error {
		color: var(--down);
	}
</style>
