<script lang="ts">
	import Button from './Button.svelte';

	let {
		page,
		totalItems,
		perPage,
		onpage,
		label = 'Pagination',
		disabled = false,
		class: extraClass = ''
	}: {
		/**
		 * The page currently shown, starting at 1. Update it when the new rows
		 * arrive, not when the request starts, and use `disabled` to cover the
		 * load, so "Page 3 of 14" is announced when the rows land.
		 */
		page: number;
		totalItems: number;
		perPage: number;
		/** Called with the page the user asked for; the app updates `page`. */
		onpage?: (page: number) => void;
		/** Accessible name for the navigation landmark. */
		label?: string;
		/** Blocks both buttons, for example while the next page loads. */
		disabled?: boolean;
		class?: string;
	} = $props();

	const safePerPage = $derived(Math.max(1, Math.floor(perPage) || 1));
	const totalPages = $derived(Math.max(1, Math.ceil(totalItems / safePerPage)));
	const currentPage = $derived(Math.min(Math.max(1, Math.floor(page) || 1), totalPages));
	const firstItem = $derived((currentPage - 1) * safePerPage + 1);
	const lastItem = $derived(Math.min(currentPage * safePerPage, totalItems));
	const atFirstPage = $derived(currentPage <= 1);
	const atLastPage = $derived(currentPage >= totalPages);

	const formatCount = (count: number) => count.toLocaleString('en-US');

	// The buttons use aria-disabled rather than the disabled attribute, so the
	// button just pressed keeps keyboard focus when it reaches the first or last
	// page, or when `disabled` turns on while the next page loads.
	function requestPage(requestedPage: number, blocked: boolean) {
		if (blocked) return;
		onpage?.(requestedPage);
	}
</script>

{#if totalItems > 0}
	<nav class="sui-pagination {extraClass}" aria-label={label}>
		<!-- The page text is the polite status region. It stays mounted while
		     paging, so each new `page` is announced; with one page the buttons
		     are gone and the region is empty and visually hidden. -->
		<div class="controls" class:visually-hidden={totalPages <= 1}>
			{#if totalPages > 1}
				<Button
					type="button"
					size="sm"
					aria-disabled={disabled || atFirstPage}
					onclick={() => requestPage(currentPage - 1, disabled || atFirstPage)}
				>
					Previous
				</Button>
			{/if}
			<span class="page-of" role="status">
				{totalPages > 1 ? `Page ${currentPage} of ${totalPages}` : ''}
			</span>
			{#if totalPages > 1}
				<Button
					type="button"
					size="sm"
					aria-disabled={disabled || atLastPage}
					onclick={() => requestPage(currentPage + 1, disabled || atLastPage)}
				>
					Next
				</Button>
			{/if}
		</div>
		<span class="range">{formatCount(firstItem)}-{formatCount(lastItem)} of {formatCount(totalItems)}</span>
	</nav>
{/if}

<style>
	.sui-pagination {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		color: var(--muted);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: var(--space-2-5);
	}

	.page-of {
		color: var(--fg);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.range {
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	/* Matches Button's disabled look for buttons that keep focus. */
	.sui-pagination :global(.sui-btn[aria-disabled='true']) {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.sui-pagination :global(.sui-btn[aria-disabled='true']:hover) {
		background: var(--card);
		border-color: var(--border-strong);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
