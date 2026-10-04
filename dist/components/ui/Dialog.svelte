<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLDialogAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';
	import { lockScroll } from '../../scroll-lock.js';
	import { PHONE_QUERY } from '../../phone.js';
	import { closesSheet, isSheetSwipe } from '../../sheet-swipe.js';

	type Size = 'default' | 'lg';

	// A dialog always has a name: the title, or a label when there is no
	// heading. The types ask for one or the other.
	type Named =
		| {
				/** The heading, as text or a snippet; it names the dialog. */
				title: string | Snippet;
				label?: string;
		  }
		| {
				title?: undefined;
				/** Accessible name when there is no title. */
				label: string;
		  };

	type Props = Named &
		Omit<HTMLDialogAttributes, 'open' | 'title' | 'onclose'> & {
		/**
		 * Shown while true. It opens as a modal when mounted, so a dialog the
		 * app renders inside an `{#if}` needs nothing more; bind it to keep
		 * the dialog mounted and open it later.
		 */
		open?: boolean;
		/** default is a 26rem card, lg a 42rem one. Both fill the screen width on phones. */
		size?: Size;
		/** Accessible name of the close button. */
		closeLabel?: string;
		/** Whether a tap on the backdrop closes the dialog. */
		closeOnBackdrop?: boolean;
		/** Called once the dialog has closed, however it closed. */
		onclose?: () => void;
		/** A row of actions under the content. */
		footer?: Snippet;
		children?: Snippet;
	};

	let {
		open = $bindable(true),
		title,
		label,
		size = 'default',
		closeLabel = 'Close',
		closeOnBackdrop = true,
		onclose,
		class: extraClass = '',
		footer,
		children,
		...rest
	}: Props = $props();

	const titleId = $props.id();
	let dialog = $state<HTMLDialogElement>();
	let pressedOnBackdrop = false;
	// Whether onclose has been sent for the current opening, so each close
	// reports once however it happened.
	let closeReported = false;

	// showModal puts the dialog in the top layer with the page inert behind
	// it, handles Escape, and moves focus in. Focus goes back to the opener
	// on close, and the page scroll is locked on narrow screens meanwhile.
	// An element still open at teardown was closed by the app setting
	// `open` to false, or by unmounting, and gets its onclose here; the
	// native close event that follows finds it already reported.
	$effect(() => {
		if (!open || !dialog) return;
		const element = dialog;
		const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const unlock = lockScroll();
		closeReported = false;
		if (!element.open) element.showModal();
		const stopSwipe = swipeToClose(element);
		return () => {
			stopSwipe();
			unlock();
			if (element.open) {
				element.close();
				reportClose();
			}
			opener?.focus();
		};
	});

	function close() {
		dialog?.close();
	}

	// How long the sheet takes to slide away after a swipe down, matching
	// its slide up on open.
	const SHEET_SLIDE_MS = 200;

	// On phones, where the dialog is a bottom sheet, a swipe down closes it:
	// the sheet follows the finger and, let go far or fast enough, slides
	// away; otherwise it springs back. Only a gesture that starts inside the
	// panel with nothing under the finger scrolled down counts, so scrolling
	// the content back up never closes it, and fields such as a slider keep
	// their own drags. Touch events, since pointer events end as soon as the
	// browser takes the gesture for a scroll. Reduced motion skips the slide.
	function swipeToClose(element: HTMLDialogElement): () => void {
		let start: { x: number; y: number } | null = null;
		let swiping = false;
		let distance = 0;
		let speed = 0;
		let last = { y: 0, time: 0 };
		const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Whether the content under the finger, or the sheet itself, is
		// scrolled down: then a drag down scrolls it back first.
		function scrolledUnder(target: Element): boolean {
			for (let node: Element | null = target; node; node = node.parentElement) {
				if (node.scrollTop > 0) return true;
				if (node === element) return false;
			}
			return false;
		}

		function settle(to: string) {
			element.style.transition = '';
			element.style.transform = to;
		}

		function touchStart(event: TouchEvent) {
			start = null;
			swiping = false;
			if (event.touches.length !== 1 || !window.matchMedia(PHONE_QUERY).matches) return;
			const target = event.target instanceof Element ? event.target : null;
			const panel = element.querySelector('.sui-dialog-panel');
			if (!target || !panel?.contains(target) || target.closest('input, textarea, select, [contenteditable]') || scrolledUnder(target)) return;
			const touch = event.touches[0];
			start = { x: touch.clientX, y: touch.clientY };
			last = { y: touch.clientY, time: event.timeStamp };
			distance = 0;
			speed = 0;
		}

		function touchMove(event: TouchEvent) {
			if (!start || event.touches.length !== 1) return;
			const touch = event.touches[0];
			if (!swiping) {
				const decided = isSheetSwipe(touch.clientX - start.x, touch.clientY - start.y);
				if (decided === null) return;
				if (!decided) {
					start = null;
					return;
				}
				swiping = true;
				element.style.transition = 'none';
			}
			event.preventDefault();
			distance = Math.max(0, touch.clientY - start.y);
			speed = (touch.clientY - last.y) / Math.max(1, event.timeStamp - last.time);
			last = { y: touch.clientY, time: event.timeStamp };
			element.style.transform = `translateY(${distance}px)`;
		}

		function touchEnd() {
			const wasSwiping = swiping;
			start = null;
			swiping = false;
			if (!wasSwiping) return;
			if (!closesSheet(distance, speed, element.getBoundingClientRect().height)) return settle('');
			if (reducedMotion()) {
				settle('');
				close();
				return;
			}
			settle('translateY(100%)');
			setTimeout(() => {
				close();
				element.style.transform = '';
			}, SHEET_SLIDE_MS);
		}

		function touchCancel() {
			if (swiping) settle('');
			start = null;
			swiping = false;
		}

		element.addEventListener('touchstart', touchStart, { passive: true });
		element.addEventListener('touchmove', touchMove, { passive: false });
		element.addEventListener('touchend', touchEnd);
		element.addEventListener('touchcancel', touchCancel);
		return () => {
			element.removeEventListener('touchstart', touchStart);
			element.removeEventListener('touchmove', touchMove);
			element.removeEventListener('touchend', touchEnd);
			element.removeEventListener('touchcancel', touchCancel);
		};
	}

	function reportClose() {
		if (closeReported) return;
		closeReported = true;
		onclose?.();
	}

	// The native close event; after an app-side close it has been handled.
	function closed() {
		if (!open) return;
		open = false;
		reportClose();
	}

	// The backdrop is the dialog element itself outside its box: a click on
	// its scrollbar also targets the element, so the point is checked too.
	function onBackdrop(event: MouseEvent) {
		if (event.target !== dialog || !dialog) return false;
		const box = dialog.getBoundingClientRect();
		return (
			event.clientX < box.left ||
			event.clientX > box.right ||
			event.clientY < box.top ||
			event.clientY > box.bottom
		);
	}

	// Only a press that starts and ends on the backdrop closes: a drag that
	// starts inside and ends outside, as selecting text does, is not a tap.
	function pointerDown(event: PointerEvent) {
		pressedOnBackdrop = onBackdrop(event);
	}

	function backdropClick(event: MouseEvent) {
		if (closeOnBackdrop && pressedOnBackdrop && onBackdrop(event)) close();
		pressedOnBackdrop = false;
	}
</script>

{#if open}
	<dialog
		bind:this={dialog}
		class="sui-dialog {size} {extraClass}"
		aria-labelledby={title ? titleId : undefined}
		aria-label={title ? undefined : label || 'Dialog'}
		{...rest}
		onclose={closed}
		onpointerdown={pointerDown}
		onclick={backdropClick}
	>
		<div class="sui-dialog-panel">
			<header class="sui-dialog-header">
				{#if title}
					<h2 id={titleId}>
						{#if typeof title === 'string'}{title}{:else}{@render title()}{/if}
					</h2>
				{/if}
				<button type="button" class="sui-dialog-close" aria-label={closeLabel} onclick={close}>
					<Icon name="close" size={18} />
				</button>
			</header>
			<div class="sui-dialog-body">
				{@render children?.()}
			</div>
			{#if footer}
				<div class="sui-dialog-footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	</dialog>
{/if}

<style>
	/* The card the app's own dialogs had: padding on the panel, not the
	   dialog, so a click on the dialog itself is a click on the backdrop. */
	.sui-dialog {
		width: min(26rem, calc(100vw - 2rem));
		max-width: none;
		max-height: calc(100dvh - 2rem);
		box-sizing: border-box;
		padding: 0;
		color: var(--fg);
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: auto;
		overscroll-behavior: contain;
	}

	.sui-dialog.lg {
		width: min(42rem, calc(100vw - 2rem));
	}

	.sui-dialog::backdrop {
		background: rgb(0 0 0 / 0.6);
	}

	.sui-dialog-panel {
		padding: var(--space-5);
	}

	.sui-dialog-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}

	.sui-dialog-header h2 {
		margin: 0;
		font-size: var(--text-lg);
		line-height: 1.3;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.sui-dialog-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		margin: calc(-1 * var(--space-1-5)) calc(-1 * var(--space-2)) calc(-1 * var(--space-1-5)) auto;
		padding: 0;
		border: 1px solid transparent;
		border-radius: var(--radius);
		background: none;
		color: var(--muted);
		cursor: pointer;
		flex-shrink: 0;
	}

	.sui-dialog-close:hover {
		color: var(--fg);
		border-color: var(--border);
	}

	.sui-dialog-close:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.sui-dialog-footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
		margin-top: var(--space-5);
	}

	/* Easier to tap on touch screens; desktop sizes stay as they are. */
	@media (pointer: coarse) {
		.sui-dialog-close {
			width: 44px;
			height: 44px;
			margin: calc(-1 * var(--space-3)) calc(-1 * var(--space-3-5)) calc(-1 * var(--space-3)) auto;
		}
	}

	/* Phones, PHONE_QUERY: a sheet docked at the bottom, with the heading and
	   the close button staying put while the content scrolls under them. It
	   stops short of the status bar, which the top safe-area inset covers.
	   A swipe down closes it (swipeToClose). */
	@media (max-width: 860px) and (pointer: coarse) {
		.sui-dialog,
		.sui-dialog.lg {
			width: 100%;
			max-height: calc(90dvh - env(safe-area-inset-top));
			margin: auto 0 0;
			border-radius: var(--radius-lg) var(--radius-lg) 0 0;
			border-bottom: 0;
		}

		.sui-dialog-panel {
			padding: 0 var(--space-4) calc(var(--space-4) + env(safe-area-inset-bottom));
		}

		.sui-dialog-header {
			position: sticky;
			top: 0;
			z-index: 1;
			margin: 0 calc(-1 * var(--space-4)) var(--space-3);
			padding: var(--space-4) var(--space-4) var(--space-2-5);
			background: var(--card);
			border-bottom: 1px solid var(--border);
		}

		/* The 44px hit box stays inside the sheet's edge and its heading row. */
		.sui-dialog-close {
			margin: calc(-1 * var(--space-2)) calc(-1 * var(--space-2)) calc(-1 * var(--space-2)) auto;
		}

		/* Slides up on open. */
		.sui-dialog[open] {
			transition: transform 200ms ease-out;
		}

		@starting-style {
			.sui-dialog[open] {
				transform: translateY(100%);
			}
		}
	}

	@media (max-width: 860px) and (pointer: coarse) and (prefers-reduced-motion: reduce) {
		.sui-dialog[open] {
			transition: none;
		}
	}
</style>
