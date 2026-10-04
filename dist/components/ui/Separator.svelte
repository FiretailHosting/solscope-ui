<script lang="ts">
	let {
		orientation = 'horizontal',
		class: extraClass = ''
	}: {
		orientation?: 'horizontal' | 'vertical';
		class?: string;
	} = $props();
</script>

<div role="separator" class="sui-separator {orientation} {extraClass}"></div>

<style>
	.sui-separator {
		background: var(--border);
	}

	.horizontal {
		width: 100%;
		height: 1px;
		margin: var(--space-2) 0;
	}

	.vertical {
		width: 1px;
		height: 100%;
		margin: 0 var(--space-2);
	}
</style>
