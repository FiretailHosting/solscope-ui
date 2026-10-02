<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface Props extends HTMLSelectAttributes {
		class?: string;
		children?: Snippet;
	}

	let { class: extraClass = '', children, ...rest }: Props = $props();
</script>

<select class="sui-select {extraClass}" {...rest}>
	{@render children?.()}
</select>

<style>
	.sui-select {
		font: inherit;
		font-size: 0.9rem;
		padding: 0.45rem 2rem 0.45rem 0.7rem;
		border-radius: var(--radius);
		border: 1px solid var(--border-strong);
		background: var(--card);
		color: var(--fg);
		appearance: none;
		/* A 10 by 5 down arrow drawn as two half-filled squares, so it takes
		   the text colour and follows the theme. */
		background-image:
			linear-gradient(45deg, transparent 50%, currentColor 50%),
			linear-gradient(135deg, currentColor 50%, transparent 50%);
		background-size: 5px 5px;
		background-repeat: no-repeat;
		background-position:
			right calc(0.65rem + 6px) center,
			right calc(0.65rem + 1px) center;
		min-width: 0;
		cursor: pointer;
		transition: border-color 120ms;
	}

	.sui-select[aria-invalid='true'] {
		border-color: var(--down);
	}

	/* 16px or more, so iOS Safari does not zoom in when the field gets focus,
	   and a 44px tap target. Desktop keeps its size. */
	@media (pointer: coarse) {
		.sui-select {
			font-size: 16px;
			min-height: 44px;
		}
	}

	.sui-select:focus {
		outline: 2px solid var(--accent);
		outline-offset: -1px;
	}
</style>
