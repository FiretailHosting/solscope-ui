<script lang="ts">
	import { tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from './Button.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The question, in bold; it takes focus when the panel opens and names the group. */
		question: string | Snippet;
		/** What the action does, after the question. */
		detail?: string | Snippet;
		confirmLabel?: string;
		cancelLabel?: string;
		/** The confirm button's label while `busy`; the confirm label otherwise. */
		busyLabel?: string;
		/** A danger-styled confirm button, for an action that cannot be undone. */
		danger?: boolean;
		/**
		 * The action is running: the group says so with aria-busy, and both
		 * buttons are aria-disabled and ignore presses, so a second tap does
		 * nothing and Escape does not back out.
		 */
		busy?: boolean;
		/**
		 * The control focus goes back to after Cancel: an element, or a
		 * function that finds one, for a button the app re-renders. Without
		 * it, the element that had focus when the panel opened.
		 */
		trigger?: HTMLElement | (() => HTMLElement | null | undefined);
		onconfirm: () => void;
		oncancel: () => void;
		/** More content between the question and the buttons. */
		children?: Snippet;
	}

	let {
		question,
		detail,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		busyLabel,
		danger = false,
		busy = false,
		trigger,
		onconfirm,
		oncancel,
		class: extraClass = '',
		children,
		...rest
	}: Props = $props();

	const questionId = $props.id();
	let root = $state<HTMLElement>();
	let questionElement = $state<HTMLElement>();
	let opener: HTMLElement | null = null;

	// The question reads first, and the whole panel, buttons included, is
	// brought into view, so on a phone the answer is never below the fold.
	$effect(() => {
		opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		questionElement?.focus({ preventScroll: true });
		root?.scrollIntoView({ block: 'nearest' });
	});

	function confirm() {
		if (busy) return;
		onconfirm();
	}

	// Focus goes back to the control that asked, once the panel is gone.
	async function cancel() {
		if (busy) return;
		oncancel();
		await tick();
		const target = typeof trigger === 'function' ? trigger() : (trigger ?? opener);
		if (target?.isConnected) target.focus();
	}

	// Escape backs out; the keys come from the buttons inside the group.
	function onkeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		event.stopPropagation();
		cancel();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={root}
	class="sui-confirm {extraClass}"
	role="group"
	aria-labelledby={questionId}
	aria-busy={busy || undefined}
	{...rest}
	{onkeydown}
>
	<p id={questionId} class="sui-confirm-question" tabindex="-1" bind:this={questionElement}>
		<strong>{#if typeof question === 'string'}{question}{:else}{@render question()}{/if}</strong>
		{#if detail}
			{#if typeof detail === 'string'}{detail}{:else}{@render detail()}{/if}
		{/if}
	</p>
	{@render children?.()}
	<div class="sui-confirm-actions">
		<Button
			type="button"
			variant={danger ? 'danger' : 'primary'}
			aria-disabled={busy || undefined}
			aria-busy={busy || undefined}
			onclick={confirm}
		>
			{busy ? (busyLabel ?? confirmLabel) : confirmLabel}
		</Button>
		<Button type="button" variant="ghost" aria-disabled={busy || undefined} onclick={cancel}>
			{cancelLabel}
		</Button>
	</div>
</div>

<style>
	/* The panel the app's own confirms had. */
	.sui-confirm {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.8rem 0.9rem;
		background: var(--card-alt);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
	}

	.sui-confirm-question {
		margin: 0;
		font-size: 0.88rem;
	}

	.sui-confirm-question:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: 2px;
	}

	.sui-confirm-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>
