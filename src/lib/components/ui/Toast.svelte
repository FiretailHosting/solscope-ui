<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import { stackToast } from '../../toast-stack.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** One line of text, or a snippet. */
		message: string | Snippet;
		/** Label of the action button; without one there is no action. */
		actionLabel?: string;
		onaction?: () => void;
		/**
		 * The action is running: its button is aria-busy and ignores presses,
		 * so a second tap does nothing. It is never disabled, so it keeps focus.
		 */
		actionBusy?: boolean;
		/** The action button's label while `actionBusy`; the action label otherwise. */
		busyLabel?: string;
		/** Accessible name of the dismiss button. */
		dismissLabel?: string;
		/**
		 * Called by the dismiss button and by Escape; without it there is no
		 * dismiss button. Focus then goes back to the element that had it before
		 * focus entered the toast, or to `main` when there was none.
		 */
		ondismiss?: () => void;
		/** How the message is announced: polite waits its turn, off says nothing. */
		live?: 'polite' | 'off';
	}

	let {
		message,
		actionLabel,
		onaction,
		actionBusy = false,
		busyLabel,
		dismissLabel = 'Dismiss',
		ondismiss,
		live = 'polite',
		class: extraClass = '',
		...rest
	}: Props = $props();

	// The live region mounts empty and the content lands a frame later, so
	// screen readers see a change in a region they already know and announce
	// it once. Nothing takes focus: the buttons sit in the normal tab order.
	let ready = $state(false);
	onMount(() => {
		const frame = requestAnimationFrame(() => (ready = true));
		return () => cancelAnimationFrame(frame);
	});

	let root = $state<HTMLElement>();
	// The element focus came from when it entered the toast, so a dismiss can
	// put it back there; nothing when it came from the page body.
	let focusedBefore: HTMLElement | null = null;

	// Every mounted toast joins one stack, so two never paint over each other:
	// this one sits at the anchor and pushes the older ones up.
	onMount(() => stackToast(root!));

	function act() {
		if (actionBusy) return;
		onaction?.();
	}

	function onfocusin(event: FocusEvent) {
		const from = event.relatedTarget;
		if (from instanceof Node && root?.contains(from)) return;
		focusedBefore = from instanceof HTMLElement ? from : null;
	}

	// A dismissed toast unmounts under the focus it holds, which would drop
	// focus to the body: it goes back where it came from instead, or to the
	// main landmark, made focusable if it is not.
	async function dismiss() {
		if (!ondismiss) return;
		const hadFocus = !!root && root.contains(document.activeElement);
		ondismiss();
		if (!hadFocus) return;
		await tick();
		if (root?.contains(document.activeElement)) return;
		if (focusedBefore?.isConnected) {
			focusedBefore.focus();
			return;
		}
		const main = document.querySelector('main');
		if (!main) return;
		if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
		main.focus();
	}

	// Escape dismisses while focus is inside the toast, and goes no further.
	function onkeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !ondismiss) return;
		event.preventDefault();
		event.stopPropagation();
		dismiss();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={root}
	class="sui-toast {extraClass}"
	role="status"
	aria-live={live}
	{...rest}
	{onkeydown}
	{onfocusin}
>
	{#if ready}
		<span class="sui-toast-message">
			{#if typeof message === 'string'}{message}{:else}{@render message()}{/if}
		</span>
		{#if actionLabel}
			<Button
				type="button"
				variant="primary"
				size="sm"
				class="sui-toast-action"
				aria-busy={actionBusy || undefined}
				onclick={act}
			>
				{actionBusy ? (busyLabel ?? actionLabel) : actionLabel}
			</Button>
		{/if}
		{#if ondismiss}
			<button type="button" class="sui-toast-dismiss" aria-label={dismissLabel} onclick={dismiss}>
				<Icon name="close" size={16} />
			</button>
		{/if}
	{/if}
</div>

<style>
	/* A small card floating over the page: fixed, so it never moves the
	   layout. Above the page and the TabBar (30), under the drawer and its
	   overlay (40, 50); a Dialog is in the top layer, above everything.
	   --sui-toast-stack-offset is set by the toast stack: how far above the
	   anchor this toast sits when newer ones are mounted under it. */
	.sui-toast {
		position: fixed;
		right: 1rem;
		bottom: calc(1rem + var(--sui-toast-stack-offset, 0px));
		z-index: 35;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		max-width: min(28rem, calc(100vw - 2rem));
		padding: 0.5rem 0.5rem 0.5rem 0.9rem;
		font-size: 0.875rem;
		line-height: 1.4;
		color: var(--fg);
		background: var(--card);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-lg);
		box-shadow: 0 2px 10px rgb(0 0 0 / 0.14);
		/* bottom: an older toast glides up when a new one lands under it. */
		transition: opacity 200ms ease-out, transform 200ms ease-out, bottom 200ms ease-out;
	}

	/* Fades and slides up as it appears. */
	@starting-style {
		.sui-toast {
			opacity: 0;
			transform: translateY(0.5rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sui-toast {
			transition: none;
		}
	}

	.sui-toast-message {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.sui-toast :global(.sui-toast-action) {
		flex-shrink: 0;
	}

	.sui-toast :global(.sui-toast-action[aria-busy='true']) {
		cursor: progress;
	}

	.sui-toast-dismiss {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		margin: 0;
		padding: 0;
		border: 1px solid transparent;
		border-radius: var(--radius);
		background: none;
		color: var(--muted);
		cursor: pointer;
		flex-shrink: 0;
	}

	.sui-toast-dismiss:hover {
		color: var(--fg);
		border-color: var(--border);
	}

	.sui-toast-dismiss:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	/* Easier to tap on touch screens; the action button grows on its own. */
	@media (pointer: coarse) {
		.sui-toast-dismiss {
			width: 44px;
			height: 44px;
		}
	}

	/* Phones, PHONE_QUERY: centred above the TabBar and the home indicator,
	   as wide as its content up to the screen less a 1rem gutter. */
	@media (max-width: 860px) and (pointer: coarse) {
		.sui-toast {
			left: 1rem;
			right: 1rem;
			bottom: calc(
				var(--tab-bar-height) + env(safe-area-inset-bottom) + 0.75rem + var(--sui-toast-stack-offset, 0px)
			);
			width: fit-content;
			max-width: calc(100vw - 2rem);
			margin: 0 auto;
		}
	}
</style>
