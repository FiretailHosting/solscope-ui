<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	interface Props extends HTMLLabelAttributes {
		class?: string;
		children?: Snippet;
	}

	let { class: extraClass = '', children, ...rest }: Props = $props();
</script>

<label class="sui-label {extraClass}" {...rest}>
	{@render children?.()}
</label>

<style>
	.sui-label {
		display: block;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--fg);
		margin-bottom: var(--space-1);
	}
</style>
