<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		class?: string;
	}

	let { class: extraClass = '', ...rest }: Props = $props();
</script>

<textarea class="sui-textarea {extraClass}" {...rest}></textarea>

<style>
	.sui-textarea {
		font: inherit;
		font-size: 0.9rem;
		padding: 0.5rem 0.7rem;
		border-radius: var(--radius);
		border: 1px solid var(--border-strong);
		background: var(--card);
		color: var(--fg);
		resize: vertical;
		line-height: 1.5;
		min-width: 0;
		width: 100%;
		transition: border-color 120ms;
	}

	.sui-textarea::placeholder {
		color: var(--muted);
	}

	.sui-textarea:focus {
		outline: 2px solid var(--accent);
		outline-offset: -1px;
	}
</style>
