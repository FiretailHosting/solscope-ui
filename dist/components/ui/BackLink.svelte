<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';

	interface Props extends HTMLAnchorAttributes {
		href: string;
		/**
		 * Hidden when the page runs from the home screen on a phone, where the
		 * app's top bar has a Back button of its own.
		 */
		hideInStandalone?: boolean;
		/**
		 * muted is the small grey link; link keeps the browser's default link
		 * look, underlined in the text colour and size, as a page's own back
		 * link had on desktop.
		 */
		variant?: 'muted' | 'link';
		/** Where the link goes, such as "Markets". */
		children?: Snippet;
	}

	let {
		href,
		hideInStandalone = false,
		variant = 'muted',
		class: extraClass = '',
		children,
		...rest
	}: Props = $props();
</script>

<a
	{href}
	class="sui-back-link {variant} {extraClass}"
	class:hide-in-standalone={hideInStandalone}
	{...rest}
>
	<Icon name="arrowLeft" size={16} />
	<span>{@render children?.()}</span>
</a>

<style>
	.sui-back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-bottom: 0.9rem;
		color: var(--muted);
		font-size: 0.85rem;
		text-decoration: none;
	}

	.sui-back-link.muted:hover {
		color: var(--fg);
	}

	/* The browser's default link: the text colour and size, underlined. */
	.sui-back-link.link {
		margin-bottom: 1rem;
		color: inherit;
		font-size: inherit;
		text-decoration: underline;
	}

	.sui-back-link:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: 2px;
	}

	/* Phones, PHONE_QUERY: a 44px tap target, with the same space under it. */
	@media (max-width: 860px) and (pointer: coarse) {
		.sui-back-link {
			min-height: 44px;
			margin-bottom: 0.2rem;
		}
	}

	@media (max-width: 860px) and (pointer: coarse) and (display-mode: standalone) {
		.sui-back-link.hide-in-standalone {
			display: none;
		}
	}
</style>
