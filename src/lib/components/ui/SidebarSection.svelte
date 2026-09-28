<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children?: Snippet } = $props();
</script>

<div class="section">
	<div class="title">{title}</div>
	{@render children?.()}
</div>

<style>
	.section {
		margin-top: 0.5rem;
	}

	.section:first-child {
		margin-top: 0;
	}

	.title {
		padding: 0.75rem 1rem 0.35rem;
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--sidebar-heading);
	}
</style>
