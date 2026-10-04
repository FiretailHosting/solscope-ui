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
		font-size: var(--text-md);
		padding: var(--space-2) var(--space-3);
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

	/* 16px or more, so iOS Safari does not zoom in when the field gets focus,
	   and a 44px tap target. Desktop keeps its size. */
	@media (pointer: coarse) {
		.sui-input {
			font-size: 16px;
			min-height: 44px;
		}
	}

	.sui-input:focus {
		outline: 2px solid var(--accent);
		outline-offset: -1px;
	}
</style>
