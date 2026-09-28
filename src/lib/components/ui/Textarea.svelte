<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		class?: string;
	}

	let { class: extraClass = '', ...rest }: Props = $props();
</script>

<textarea class="textarea {extraClass}" {...rest}></textarea>

<style>
	.textarea {
		font: inherit;
		font-size: 0.9rem;
		padding: 0.5rem 0.7rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--fg);
		resize: vertical;
		line-height: 1.5;
		min-width: 0;
		width: 100%;
		transition: border-color 120ms;
	}

	.textarea::placeholder {
		color: var(--muted);
	}

	.textarea:focus {
		outline: 2px solid var(--accent);
		outline-offset: -1px;
	}
</style>
