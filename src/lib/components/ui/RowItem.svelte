<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
		/** Makes the row, apart from `actions`, one link. */
		href?: string;
		/** The first line: the name, with an avatar or a symbol beside it. */
		children?: Snippet;
		/** The second line under the name, muted: a status, an email, a note. */
		detail?: string | Snippet;
		/** The first line's right-hand cell, such as a price or a value. */
		value?: string | Snippet;
		/** Read before a bare `value`, such as "Value", so a number is not read alone. */
		valueLabel?: string;
		/** The second line's right-hand cell, muted, such as a change. */
		note?: string | Snippet;
		/** Read before a bare `note`, such as "Return". */
		noteLabel?: string;
		/** Controls at the end of the row, outside the link. */
		actions?: Snippet;
	}

	let {
		href,
		class: extraClass = '',
		children,
		detail,
		value,
		valueLabel,
		note,
		noteLabel,
		actions,
		...rest
	}: Props = $props();
</script>

<!-- The label and the number are two nodes with a space between, which a
     screen reader reads as "Value $9,550" and a flex line does not show. -->
{#snippet cell(content: string | Snippet, label: string | undefined)}
	{#if label}<span class="sr-only">{label}</span>{/if}
	{#if typeof content === 'string'}{content}{:else}{@render content()}{/if}
{/snippet}

{#snippet body()}
	<span class="sui-row-main">
		<span class="sui-row-line">{@render children?.()}</span>
		{#if detail}<span class="sui-row-line sui-row-muted">{@render cell(detail, undefined)}</span>{/if}
	</span>
	{#if value || note}
		<span class="sui-row-end">
			{#if value}<span class="sui-row-line">{@render cell(value, valueLabel)}</span>{/if}
			{#if note}<span class="sui-row-line sui-row-muted">{@render cell(note, noteLabel)}</span>{/if}
		</span>
	{/if}
{/snippet}

<li class="sui-row-item {extraClass}" {...rest}>
	{#if href}
		<a class="sui-row-body sui-row-link" {href}>{@render body()}</a>
	{:else}
		<div class="sui-row-body">{@render body()}</div>
	{/if}
	{#if actions}
		<span class="sui-row-actions">{@render actions()}</span>
	{/if}
</li>

<style>
	.sui-row-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sui-row-item + .sui-row-item {
		border-top: 1px solid var(--border);
	}

	/* Name and detail on the left, value and note on the right. */
	.sui-row-body {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.2rem 0.75rem;
		min-width: 0;
		padding: 0.6rem 1rem;
		color: inherit;
		text-decoration: none;
	}

	/* The link is the whole row, so a tap anywhere on it opens the page. */
	@media (pointer: coarse) {
		.sui-row-body {
			min-height: 44px;
		}
	}

	.sui-row-link:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}

	/* A pressed state where there is no hover, so a tap gives feedback. */
	@media (hover: none) {
		.sui-row-link:active {
			background: var(--card-alt);
		}
	}

	.sui-row-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.sui-row-end {
		flex: none;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.2rem;
		text-align: right;
		white-space: nowrap;
	}

	.sui-row-line {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.2rem 0.4rem;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.sui-row-end .sui-row-line {
		justify-content: flex-end;
	}

	.sui-row-muted {
		font-size: 0.8rem;
		color: var(--muted);
	}

	/* Keeps its place at the end of the row, outside the link. */
	.sui-row-actions {
		flex: none;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding-right: 0.75rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
