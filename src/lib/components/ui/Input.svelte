<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		class?: string;
	}

	let { class: extraClass = '', ...rest }: Props = $props();
</script>

<input class="sui-input {extraClass}" {...rest} />

<style>
	.sui-input {
		font: inherit;
		font-size: 0.9rem;
		padding: 0.45rem 0.7rem;
		border-radius: var(--radius);
		border: 1px solid var(--border-strong);
		background: var(--card);
		color: var(--fg);
		min-width: 0;
		width: 100%;
		transition: border-color 120ms;
	}

	.sui-input::placeholder {
		color: var(--muted);
	}

	.sui-input[aria-invalid='true'] {
		border-color: var(--down);
	}

	.sui-input:focus {
		outline: 2px solid var(--accent);
		outline-offset: -1px;
	}
</style>
