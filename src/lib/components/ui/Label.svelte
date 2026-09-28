<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	interface Props extends HTMLLabelAttributes {
		class?: string;
		children?: Snippet;
	}

	let { class: extraClass = '', children, ...rest }: Props = $props();
</script>

<label class="label {extraClass}" {...rest}>
	{@render children?.()}
</label>

<style>
	.label {
		display: block;
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--fg);
		margin-bottom: 0.3rem;
	}
</style>
