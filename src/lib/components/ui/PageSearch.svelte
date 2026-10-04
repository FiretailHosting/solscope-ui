<script lang="ts">
	import { flushSync, type Snippet } from 'svelte';
	import Dialog from './Dialog.svelte';
	import Icon from './Icon.svelte';
	import Skeleton from './Skeleton.svelte';
	import {
		filterPages,
		searchSummary,
		type PageSearchItem,
		type PageSearchSection
	} from '../../page-search.js';

	let {
		open = $bindable(false),
		query = $bindable(''),
		closedSections = $bindable([]),
		pages,
		sections,
		pageLimit,
		pagesTitle = 'Pages',
		noMatchesText = 'No matches',
		title = 'Search pages',
		fieldLabel = 'Page name',
		placeholder = 'Search pages',
		emptyText = 'No pages match.',
		onclose
	}: {
		/** Shown while true. Bind it; open it with `show()` from a tap, so iOS raises the keyboard. */
		open?: boolean;
		/** What is typed; bind it to search `sections` as it changes. It empties on each opening. */
		query?: string;
		/** The ids of the sections the user closed, `'pages'` for the pages; bind it to keep them closed across reloads. */
		closedSections?: string[];
		/** Every page that can be reached, each with a unique href, in the order they are offered with nothing typed. */
		pages: PageSearchItem[];
		/**
		 * Result sections under the pages, such as coins. Given, even empty,
		 * the pages become a section too and each section a disclosure that
		 * can be closed.
		 */
		sections?: PageSearchSection[];
		/** At most this many pages once something is typed; all of them with nothing typed. */
		pageLimit?: number;
		/** Heading of the pages section. */
		pagesTitle?: string;
		/** Shown in a section with no results. */
		noMatchesText?: string;
		/** The sheet's heading, which names the dialog; use the opening button's name. */
		title?: string;
		/** Accessible name of the search field. */
		fieldLabel?: string;
		placeholder?: string;
		/** Without `sections`: shown, and read out, when nothing matches. */
		emptyText?: string;
		/** Called once the sheet has closed, however it closed. */
		onclose?: () => void;
	} = $props();

	const listId = $props.id();
	let field = $state<HTMLInputElement>();
	let list = $state<HTMLElement>();

	const matches = $derived(filterPages(pages, query));
	const shownPages = $derived(
		pageLimit !== undefined && query.trim() ? matches.slice(0, pageLimit) : matches
	);
	const countText = $derived.by(() => {
		if (sections) {
			return searchSummary([
				{ count: shownPages.length, noun: ['page', 'pages'] },
				...sections.map((section) => ({
					count: section.results.length,
					noun: section.noun ?? (['result', 'results'] as [string, string]),
					loading: section.loading,
					error: section.error
				}))
			]);
		}
		return matches.length === 0 ? emptyText : matches.length === 1 ? '1 page' : `${matches.length} pages`;
	});

	function toggleSection(id: string) {
		closedSections = closedSections.includes(id)
			? closedSections.filter((closed) => closed !== id)
			: [...closedSections, id];
	}

	// Opens the sheet and focuses its field within the calling tap, which iOS
	// needs to raise the keyboard: flushSync mounts the dialog and runs its
	// showModal now rather than after the handler returns.
	export function show() {
		query = '';
		open = true;
		flushSync();
		field?.focus();
	}

	// Each opening starts empty, also when the app sets `open` itself.
	$effect(() => {
		if (open) return;
		query = '';
	});

	// The count is read out once typing pauses, and only when it changed:
	// a status region announces each new text, not each keystroke. With
	// sections it waits until none is loading, so every count comes at once.
	let announced = $state('');
	$effect(() => {
		if (!open) {
			announced = '';
			return;
		}
		const text = countText;
		if (!text) return;
		const timer = setTimeout(() => (announced = text), 500);
		return () => clearTimeout(timer);
	});

	function currentOf(active: PageSearchItem['active']): 'page' | 'true' | undefined {
		if (!active) return undefined;
		return active === 'section' ? 'true' : 'page';
	}

	// The results in order, leaving out those in closed sections.
	function links(): HTMLAnchorElement[] {
		return list ? [...list.querySelectorAll('a')].filter((link) => !link.closest('[hidden]')) : [];
	}

	// Return goes to the first match in an open section; Down steps into the
	// results. Return that confirms an input method's composition is left to it.
	function fieldKeydown(event: KeyboardEvent) {
		if (event.isComposing) return;
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

	// Up and Down move through the links, across sections and past closed
	// ones, Up from the first goes back to the field, and Home and End jump
	// to either end. Tab works as anywhere else, also onto section headings.
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
	<!-- autofocus: showModal focuses the field directly, not Close first. -->
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:this={field}
		bind:value={query}
		class="sui-page-search-field"
		type="search"
		aria-label={fieldLabel}
		aria-controls={listId}
		{placeholder}
		autofocus
		autocomplete="off"
		autocapitalize="off"
		spellcheck="false"
		enterkeyhint="go"
		onkeydown={fieldKeydown}
	/>
	<p class="sui-page-search-status" role="status">{announced}</p>
	{#if sections}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div bind:this={list} id={listId} class="sui-page-search-sections" onkeydown={listKeydown}>
			{#snippet pageRows()}
				{#if shownPages.length === 0}
					<p class="sui-page-search-none">{noMatchesText}</p>
				{:else}
					<!-- svelte-ignore a11y_no_redundant_roles -->
					<ul class="sui-page-search-list" role="list" aria-label={pagesTitle}>
						{#each shownPages as page, index (`${index}:${page.href}`)}
							<li>{@render pageLink(page)}</li>
						{/each}
					</ul>
				{/if}
			{/snippet}
			{@render disclosure(0, 'pages', pagesTitle, shownPages.length, pageRows)}
			{#each sections as section, sectionIndex (section.id)}
				{#snippet sectionRows()}
					{#if section.loading}
						<!-- Skeleton rows the size of results, which replace them. -->
						<!-- svelte-ignore a11y_no_redundant_roles -->
						<ul class="sui-page-search-list" role="list" aria-label={section.title} aria-busy="true">
							{#each { length: 3 }, index (index)}
								<li class="placeholder">
									<Skeleton width="22px" height="22px" radius="var(--radius-full)" />
									<Skeleton width="7rem" />
									<span class="value"><Skeleton width="4rem" /></span>
								</li>
							{/each}
						</ul>
					{:else if section.error}
						<p class="sui-page-search-none error"><Icon name="alert" size={16} />{section.error}</p>
					{:else if section.results.length === 0}
						<p class="sui-page-search-none">{section.emptyText ?? noMatchesText}</p>
					{:else}
						<!-- svelte-ignore a11y_no_redundant_roles -->
						<ul class="sui-page-search-list" role="list" aria-label={section.title}>
							{#each section.results as result, index (`${index}:${result.href}`)}
								<li>
									<a href={result.href} onclick={picked}>
										{#if result.image}
											<img class="image" src={result.image} alt="" width="22" height="22" loading="lazy" />
										{:else}
											<span class="image" aria-hidden="true"></span>
										{/if}
										<span class="name">
											{result.label}{#if result.detail}<span class="visually-hidden">, </span>
												<span class="detail">{result.detail}</span>{/if}
										</span>
										{#if result.value}
											<span class="value">
												{#if result.valueLabel}<span class="visually-hidden">, {result.valueLabel} </span>{/if}{result.value}
											</span>
										{/if}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				{/snippet}
				{@render disclosure(
					sectionIndex + 1,
					section.id,
					section.title,
					section.loading || section.error ? null : section.results.length,
					sectionRows
				)}
			{/each}
		</div>
	{:else}
		{#if matches.length === 0}
			<p class="sui-page-search-empty">{emptyText}</p>
		{/if}
		<!-- role="list": Safari drops list semantics from a list without bullets. -->
		<!-- svelte-ignore a11y_no_redundant_roles -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<ul bind:this={list} id={listId} class="sui-page-search-list" role="list" aria-label="Pages" onkeydown={listKeydown}>
			{#each matches as page, index (`${index}:${page.href}`)}
				<li>{@render pageLink(page)}</li>
			{/each}
		</ul>
	{/if}
</Dialog>

{#snippet pageLink(page: PageSearchItem)}
	<a href={page.href} aria-current={currentOf(page.active)} onclick={picked}>
		<Icon name={page.icon} size={18} />
		<span class="name">{page.label}</span>
		{#if page.badge}
			<span class="badge" aria-hidden="true">{page.badge > 99 ? '99+' : page.badge}</span>
			<span class="visually-hidden">, {page.badge} unread</span>
		{/if}
		{#if page.section}
			<span class="visually-hidden">, </span><span class="section">{page.section}</span>
		{/if}
	</a>
{/snippet}

<!-- A section's heading is a button that opens and closes it: aria-expanded
     says which, and the chevron turns, pointing down when open. The count
     shows "--" while the results load. -->
{#snippet disclosure(index: number, id: string, heading: string, count: number | null, body: Snippet)}
	{@const closed = closedSections.includes(id)}
	{@const bodyId = `${listId}-section-${index}`}
	<h3 class="sui-page-search-heading">
		<button type="button" aria-expanded={!closed} aria-controls={bodyId} onclick={() => toggleSection(id)}>
			<span class="chevron"><Icon name="chevronDown" size={16} /></span>
			<!-- Read out as "Pages, 3". -->
			<span class="heading">{heading}{#if count !== null}<span class="visually-hidden">,</span>{/if}</span>
			{#if count === null}
				<span class="count" aria-hidden="true">--</span>
			{:else}
				<span class="count">{count}</span>
			{/if}
		</button>
	</h3>
	<div id={bodyId} hidden={closed}>
		{@render body()}
	</div>
{/snippet}

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

	.sui-page-search-status,
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.sui-page-search-empty {
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
		position: relative;
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

	/* The page shown: a bar at the start edge as well as the accent and
	   weight, so it is told apart by shape too. */
	.sui-page-search-list a[aria-current] {
		color: var(--accent);
		font-weight: 600;
	}

	.sui-page-search-list a[aria-current]::before {
		content: '';
		position: absolute;
		left: 0;
		top: var(--space-2);
		bottom: var(--space-2);
		width: 3px;
		background: var(--accent);
		border-radius: var(--radius-full);
	}

	.sui-page-search-list a[aria-current] :global(svg) {
		color: var(--accent);
	}

	.name {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 var(--space-1);
		border-radius: var(--radius-full);
		background: var(--down);
		color: var(--down-fg);
		font-size: var(--text-2xs);
		font-weight: 700;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	/* Sections: a heading button over each list, the lists flush under it. */
	.sui-page-search-sections .sui-page-search-list {
		margin: 0;
	}

	.sui-page-search-heading {
		margin: var(--space-2) 0 0;
		font-size: inherit;
	}

	.sui-page-search-heading button {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		min-height: 44px;
		padding: 0 var(--space-2);
		border: 0;
		border-radius: var(--radius);
		background: none;
		color: var(--fg);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
		text-align: left;
		cursor: pointer;
	}

	/* Hover only where there is a pointer: on touch it would stick after a tap. */
	@media (hover: hover) {
		.sui-page-search-heading button:hover {
			background: var(--card-alt);
		}
	}

	.sui-page-search-heading button:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}

	.chevron {
		display: inline-flex;
		color: var(--muted);
		transition: transform 150ms ease;
	}

	[aria-expanded='false'] .chevron {
		transform: rotate(-90deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.chevron {
			transition: none;
		}
	}

	.count {
		box-sizing: border-box;
		min-width: 1.75rem;
		padding: 0 var(--space-1-5);
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		color: var(--muted);
		font-size: var(--text-xs);
		line-height: 1.4;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	/* A section's "no matches" or error, a row's height so the sheet keeps
	   its shape as results come and go. */
	.sui-page-search-none {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		box-sizing: border-box;
		min-height: 44px;
		margin: 0;
		padding: var(--space-2);
		color: var(--muted);
		font-size: var(--text-sm);
	}

	.sui-page-search-none.error {
		color: var(--fg);
	}

	.sui-page-search-none.error :global(svg) {
		flex-shrink: 0;
		color: var(--down);
	}

	.sui-page-search-list .placeholder {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		box-sizing: border-box;
		min-height: 44px;
		padding: var(--space-2);
	}

	.image {
		flex-shrink: 0;
		width: 22px;
		height: 22px;
		border-radius: var(--radius-full);
		object-fit: cover;
	}

	span.image {
		box-sizing: border-box;
		border: 1px solid var(--border);
	}

	.detail {
		color: var(--muted);
		font-size: var(--text-sm);
	}

	.value {
		margin-left: auto;
		padding-left: var(--space-2);
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
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
