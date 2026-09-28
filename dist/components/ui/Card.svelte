<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: extraClass = '',
		children
	}: { class?: string; children?: Snippet } = $props();
</script>

<div class="card {extraClass}">
	{@render children?.()}
</div>

<style>
	.card {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.1rem 1.25rem;
	}
</style>
