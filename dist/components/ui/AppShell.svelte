<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: extraClass = '',
		sidebar,
		children
	}: {
		class?: string;
		sidebar?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<div class="shell {extraClass}">
	{#if sidebar}
		{@render sidebar()}
	{/if}
	<div class="main-area">
		{@render children?.()}
	</div>
</div>

<style>
	.shell {
		display: flex;
		min-height: 100dvh;
		width: 100%;
	}

	.main-area {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
</style>
