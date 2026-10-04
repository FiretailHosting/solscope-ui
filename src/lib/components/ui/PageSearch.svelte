<script lang="ts">
	import Dialog from './Dialog.svelte';
	import Icon from './Icon.svelte';
	import { filterPages, type PageSearchItem } from '../../page-search.js';

	let {
		open = $bindable(false),
		pages,
		title = 'Go to page',
		fieldLabel = 'Search pages',
		placeholder = 'Search pages',
		emptyText = 'No pages match.',
		onclose
	}: {
		/** Shown while true; bind it, and set it from the button that opens the search. */
		open?: boolean;
		/** Every page that can be reached, in the order they are offered with nothing typed. */
		pages: PageSearchItem[];
		/** The sheet's heading, which names the dialog. */
		title?: string;
		/** Accessible name of the search field. */
		fieldLabel?: string;
		placeholder?: string;
		/** Shown, and read out, when nothing matches. */
		emptyText?: string;
		/** Called once the sheet has closed, however it closed. */
		onclose?: () => void;
	} = $props();

	const listId = $props.id();
	let query = $state('');
	let field = $state<HTMLInputElement>();
	let list = $state<HTMLUListElement>();

	const matches = $derived(filterPages(pages, query));
	const countText = $derived(
		matches.length === 0 ? emptyText : matches.length === 1 ? '1 page' : `${matches.length} pages`
	);

	// Each opening starts empty, with the field focused for typing. The
	// Dialog's showModal would focus its close button first.
	$effect(() => {
		if (!open) return;
		query = '';
		const frame = requestAnimationFrame(() => field?.focus());
		return () => cancelAnimationFrame(frame);
	});

	function links(): HTMLAnchorElement[] {
		return list ? [...list.querySelectorAll('a')] : [];
	}

	// Return goes to the first match; Down steps into the list.
	function fieldKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			const first = links()[0];
			if (!first) return;
			event.preventDefault();
			first.click();
		} else if (event.key === 'ArrowDown') {
			const first = links()[0];
			if (!first) return;
			event.preventDefault();
			first.focus();
		}
	}

	// Up and Down move through the links, Up from the first goes back to the
	// field, and Home and End jump to either end. Tab works as anywhere else.
	function listKeydown(event: KeyboardEvent) {
		const all = links();
		const index = all.indexOf(document.activeElement as HTMLAnchorElement);
		if (index < 0) return;
		let next: HTMLElement | undefined;
		if (event.key === 'ArrowDown') next = all[Math.min(index + 1, all.length - 1)];
		else if (event.key === 'ArrowUp') next = index === 0 ? field : all[index - 1];
		else if (event.key === 'Home') next = all[0];
		else if (event.key === 'End') next = all[all.length - 1];
		else return;
		event.preventDefault();
		next?.focus();
	}

	// The link navigates; the sheet closes behind it.
	function picked() {
		open = false;
	}
</script>

<Dialog bind:open {title} class="sui-page-search" {onclose}>
	<input
		bind:this={field}
		bind:value={query}
		class="sui-page-search-field"
		type="search"
		aria-label={fieldLabel}
		aria-controls={listId}
		aria-describedby="{listId}-count"
		{placeholder}
		autocomplete="off"
		autocapitalize="off"
		spellcheck="false"
		enterkeyhint="go"
		onkeydown={fieldKeydown}
	/>
	<!-- Read out politely as the list changes, and shown when nothing matches. -->
	<p id="{listId}-count" class="sui-page-search-count" class:empty={matches.length === 0} role="status">
		{countText}
	</p>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<ul bind:this={list} id={listId} class="sui-page-search-list" aria-label="Pages" onkeydown={listKeydown}>
		{#each matches as page (page.href)}
			<li>
				<a href={page.href} aria-current={page.active ? 'page' : undefined} onclick={picked}>
					<Icon name={page.icon} size={18} />
					<span class="name">{page.label}</span>
					{#if page.section}<span class="section">{page.section}</span>{/if}
				</a>
			</li>
		{/each}
	</ul>
</Dialog>

<style>
	/* A fixed height, so the field stays put while the list shrinks as you
	   type: the sheet docks at the bottom, and a shorter one would move its
	   top. The list scrolls inside it. */
	:global(.sui-dialog.sui-page-search) {
		height: min(34rem, calc(100dvh - 2rem));
	}

	@media (max-width: 860px) and (pointer: coarse) {
		:global(.sui-dialog.sui-page-search) {
			height: calc(90dvh - env(safe-area-inset-top));
		}
	}

	.sui-page-search-field {
		width: 100%;
		box-sizing: border-box;
		min-height: 44px;
		padding: var(--space-2) var(--space-3);
		font: inherit;
		/* 16px: iOS zooms into a smaller focused field. */
		font-size: max(1rem, var(--text-md));
		color: var(--fg);
		background: var(--card-alt);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
	}

	.sui-page-search-field:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}

	/* The count is for screen readers, unless nothing matches. */
	.sui-page-search-count {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.sui-page-search-count.empty {
		position: static;
		width: auto;
		height: auto;
		overflow: visible;
		clip-path: none;
		white-space: normal;
		margin: var(--space-4) 0 0;
		color: var(--muted);
		font-size: var(--text-sm);
		text-align: center;
	}

	.sui-page-search-list {
		list-style: none;
		margin: var(--space-2) 0 0;
		padding: 0;
	}

	.sui-page-search-list a {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: 44px;
		padding: var(--space-2) var(--space-2);
		border-radius: var(--radius);
		color: var(--fg);
		text-decoration: none;
		font-size: var(--text-md);
	}

	.sui-page-search-list a :global(svg) {
		flex-shrink: 0;
		color: var(--muted);
	}

	.sui-page-search-list a:hover {
		background: var(--card-alt);
	}

	@media (hover: none) {
		.sui-page-search-list a:active {
			background: var(--card-alt);
		}
	}

	.sui-page-search-list a:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}

	/* The page shown: accent and weight, with its icon in the accent too. */
	.sui-page-search-list a[aria-current='page'] {
		color: var(--accent);
		font-weight: 600;
	}

	.sui-page-search-list a[aria-current='page'] :global(svg) {
		color: var(--accent);
	}

	.name {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.section {
		margin-left: auto;
		padding-left: var(--space-2);
		flex-shrink: 0;
		color: var(--muted);
		font-size: var(--text-xs);
		font-weight: 400;
	}
</style>
