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
		margin-top: var(--space-2);
	}

	.section:first-child {
		margin-top: 0;
	}

	.title {
		padding: var(--space-3) var(--space-4) var(--space-1-5);
		font-size: var(--text-2xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--sidebar-heading);
	}
</style>
