<script lang="ts">
	import { flushSync } from 'svelte';
	import Dialog from './Dialog.svelte';
	import Icon from './Icon.svelte';
	import { filterPages, type PageSearchItem } from '../../page-search.js';

	let {
		open = $bindable(false),
		pages,
		title = 'Search pages',
		fieldLabel = 'Page name',
		placeholder = 'Search pages',
		emptyText = 'No pages match.',
		onclose
	}: {
		/** Shown while true. Bind it; open it with `show()` from a tap, so iOS raises the keyboard. */
		open?: boolean;
		/** Every page that can be reached, each with a unique href, in the order they are offered with nothing typed. */
		pages: PageSearchItem[];
		/** The sheet's heading, which names the dialog; use the opening button's name. */
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
	// a status region announces each new text, not each keystroke.
	let announced = $state('');
	$effect(() => {
		if (!open) {
			announced = '';
			return;
		}
		const text = countText;
		const timer = setTimeout(() => (announced = text), 500);
		return () => clearTimeout(timer);
	});

	function currentOf(active: PageSearchItem['active']): 'page' | 'true' | undefined {
		if (!active) return undefined;
		return active === 'section' ? 'true' : 'page';
	}

	function links(): HTMLAnchorElement[] {
		return list ? [...list.querySelectorAll('a')] : [];
	}

	// Return goes to the first match; Down steps into the list. Return that
	// confirms an input method's composition is left to it.
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
	{#if matches.length === 0}
		<p class="sui-page-search-empty">{emptyText}</p>
	{/if}
	<!-- role="list": Safari drops list semantics from a list without bullets. -->
	<!-- svelte-ignore a11y_no_redundant_roles -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<ul bind:this={list} id={listId} class="sui-page-search-list" role="list" aria-label="Pages" onkeydown={listKeydown}>
		{#each matches as page, index (`${index}:${page.href}`)}
			<li>
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

	.section {
		margin-left: auto;
		padding-left: var(--space-2);
		flex-shrink: 0;
		color: var(--muted);
		font-size: var(--text-xs);
		font-weight: 400;
	}
</style>
