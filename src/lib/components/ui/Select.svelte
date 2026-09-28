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
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f6b7a' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.65rem center;
		min-width: 0;
		cursor: pointer;
		transition: border-color 120ms;
	}

	.sui-select:focus {
		outline: 2px solid var(--accent);
		outline-offset: -1px;
	}
</style>
