<script lang="ts">
	// A grey placeholder where content will appear once it loads. It is
	// hidden from screen readers; mark the loading region with aria-busy.
	let {
		width = '100%',
		height = '1em',
		radius = 'var(--radius-sm)',
		class: extraClass = ''
	}: {
		/** Any CSS width, such as '12rem' or '60%'. */
		width?: string;
		/** Any CSS height; the default matches the surrounding text. */
		height?: string;
		/** Any CSS border radius; use 'var(--radius-full)' for a circle. */
		radius?: string;
		class?: string;
	} = $props();
</script>

<span
	class="sui-skeleton {extraClass}"
	style:width
	style:height
	style:border-radius={radius}
	aria-hidden="true"
></span>

<style>
	.sui-skeleton {
		display: inline-block;
		vertical-align: middle;
		max-width: 100%;
		background: var(--border);
		animation: sui-skeleton-pulse 1.4s ease-in-out infinite;
	}

	@keyframes sui-skeleton-pulse {
		50% {
			opacity: 0.5;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sui-skeleton {
			animation: none;
		}
	}
</style>
