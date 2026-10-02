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
		/** Where the link goes, such as "Markets". */
		children?: Snippet;
	}

	let { href, hideInStandalone = false, class: extraClass = '', children, ...rest }: Props = $props();
</script>

<a {href} class="sui-back-link {extraClass}" class:hide-in-standalone={hideInStandalone} {...rest}>
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

	.sui-back-link:hover {
		color: var(--fg);
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
