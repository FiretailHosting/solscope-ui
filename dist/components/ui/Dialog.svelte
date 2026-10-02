<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLDialogAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';
	import { lockScroll } from '../../scroll-lock.js';

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
		return () => {
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
		padding: 1.25rem;
	}

	.sui-dialog-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.sui-dialog-header h2 {
		margin: 0;
		font-size: 1.1rem;
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
		margin: -0.35rem -0.5rem -0.35rem auto;
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
		gap: 0.5rem;
		margin-top: 1.25rem;
	}

	/* Easier to tap on touch screens; desktop sizes stay as they are. */
	@media (pointer: coarse) {
		.sui-dialog-close {
			width: 44px;
			height: 44px;
			margin: -0.75rem -0.9rem -0.75rem auto;
		}
	}

	/* Phones, PHONE_QUERY: a sheet docked at the bottom, with the heading and
	   the close button staying put while the content scrolls under them. It
	   stops short of the status bar, which the top safe-area inset covers. */
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
			padding: 0 1rem calc(1rem + env(safe-area-inset-bottom));
		}

		.sui-dialog-header {
			position: sticky;
			top: 0;
			z-index: 1;
			margin: 0 -1rem 0.75rem;
			padding: 1rem 1rem 0.6rem;
			background: var(--card);
			border-bottom: 1px solid var(--border);
		}

		/* The 44px hit box stays inside the sheet's edge and its heading row. */
		.sui-dialog-close {
			margin: -0.5rem -0.5rem -0.5rem auto;
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
