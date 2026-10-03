<script lang="ts" module>
	export type SegmentedOption<OptionValue> = {
		value: OptionValue;
		label: string;
		disabled?: boolean;
	};
</script>

<script lang="ts" generics="Value">
	import type { Snippet } from 'svelte';

	let {
		label = '',
		class: extraClass = '',
		options,
		value = $bindable(),
		onchange,
		children
	}: {
		label?: string;
		class?: string;
		/** Renders one button per option; without it, `children` are rendered as the buttons. */
		options?: SegmentedOption<Value>[];
		/** The selected option's value, for use with `options`. */
		value?: Value;
		onchange?: (value: Value) => void;
		children?: Snippet;
	} = $props();

	function select(optionValue: Value) {
		value = optionValue;
		onchange?.(optionValue);
	}
</script>

<div class="sui-segmented {extraClass}" role="group" aria-label={label}>
	{#if options}
		{#each options as option}
			<button
				type="button"
				class:active={option.value === value}
				aria-pressed={option.value === value}
				disabled={option.disabled}
				onclick={() => select(option.value)}
			>
				{option.label}
			</button>
		{/each}
	{:else}
		{@render children?.()}
	{/if}
</div>

<style>
	.sui-segmented {
		display: inline-flex;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		overflow: hidden;
		background: var(--card);
	}

	/* Buttons rendered from options, or plain <button> children with class:active */
	.sui-segmented :global(button) {
		font: inherit;
		font-size: 0.82rem;
		padding: 0.3rem 0.8rem;
		border: 0;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		transition: color 120ms, background 120ms, box-shadow 120ms;
	}

	.sui-segmented :global(button + button) {
		border-left: 1px solid var(--border-strong);
	}

	.sui-segmented :global(button.active) {
		color: var(--accent-fg);
		background: var(--accent);
		font-weight: 600;
	}

	.sui-segmented :global(button:hover:not(.active):not(:disabled)) {
		color: var(--fg);
	}

	.sui-segmented :global(button:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}

	/* The selected segment is filled with the accent, so its ring takes the text color instead. */
	.sui-segmented :global(button.active:focus-visible) {
		outline-color: var(--accent-fg);
		outline-offset: -4px;
	}

	.sui-segmented :global(button:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Easier to tap on touch screens; desktop sizes stay as they are. */
	@media (pointer: coarse) {
		.sui-segmented :global(button) {
			min-height: 44px;
		}
	}
</style>
