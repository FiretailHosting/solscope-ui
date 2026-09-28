<script lang="ts">
	import { icons, type IconName } from '../../icons/icons.js';

	let {
		name,
		size = 18,
		label = '',
		class: extraClass = ''
	}: {
		name: IconName;
		size?: number | string;
		/** Accessible name. Without one the icon is decorative and hidden. */
		label?: string;
		class?: string;
	} = $props();

	const icon = $derived(icons[name]);
</script>

<svg
	class="icon {extraClass}"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.6"
	stroke-linecap="square"
	stroke-linejoin="miter"
	role={label ? 'img' : undefined}
	aria-label={label || undefined}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"
>
	{#each icon.d as d (d)}
		<path {d} />
	{/each}
	{#each 'fill' in icon ? icon.fill : [] as d (d)}
		<path {d} fill="currentColor" stroke="none" />
	{/each}
	{#each 'nodes' in icon ? icon.nodes : [] as [cx, cy] (`${cx},${cy}`)}
		<circle {cx} {cy} r="1.35" fill="currentColor" stroke="none" />
	{/each}
</svg>

<style>
	.icon {
		display: inline-block;
		flex-shrink: 0;
		vertical-align: middle;
	}
</style>
