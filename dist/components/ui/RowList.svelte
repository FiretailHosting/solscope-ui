<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
		/** Accessible name of the list, such as "Bots". */
		label?: string;
		/** The rows are still loading: said with aria-busy while skeleton rows stand in. */
		busy?: boolean;
		/** RowItems. */
		children?: Snippet;
	}

	let { label, busy = false, class: extraClass = '', children, ...rest }: Props = $props();
</script>

<ul class="sui-row-list {extraClass}" aria-label={label} aria-busy={busy || undefined} {...rest}>
	{@render children?.()}
</ul>

<style>
	/* Edge to edge inside a flush Card, like a Table. */
	.sui-row-list {
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: 0.88rem;
		font-variant-numeric: tabular-nums;
	}
</style>
