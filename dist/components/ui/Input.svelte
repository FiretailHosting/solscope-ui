<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		class?: string;
	}

	let { class: extraClass = '', ...rest }: Props = $props();
</script>

<input class="input {extraClass}" {...rest} />

<style>
	.input {
		font: inherit;
		font-size: 0.9rem;
		padding: 0.45rem 0.7rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--fg);
		min-width: 0;
		width: 100%;
		transition: border-color 120ms;
	}

	.input::placeholder {
		color: var(--muted);
	}

	.input:focus {
		outline: 2px solid var(--accent);
		outline-offset: -1px;
	}
</style>
