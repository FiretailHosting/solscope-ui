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

<!-- A label wrapping the input names it, and clicking the text focuses it.
     The hint and the error sit outside the label, so they are not read as
     part of the field's name; the input points at them with
     aria-describedby. The error is not announced on its own: a submit that
     fails several fields would read them all at once. -->
<div class="sui-field {extraClass}">
	<label class="field-control">
		{#if label}
			<span class="field-label">{label}</span>
		{/if}
		{@render children?.()}
	</label>
	{#if error}
		<small class="error" id={errorId}>{error}</small>
	{:else if hint}
		<small class="hint" id={hintId}>{hint}</small>
	{/if}
</div>

<style>
	.sui-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-bottom: var(--space-3-5);
	}

	.field-control {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
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
