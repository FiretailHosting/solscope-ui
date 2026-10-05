<script lang="ts" generics="Value">
	import { collapseQuery, optionForSelectValue, selectedOptionIndex, type RangeOption } from '../../range-options.js';
	import SegmentedControl from './SegmentedControl.svelte';
	import Select from './Select.svelte';

	// A chart's range, such as 1H to 1Y: segmented buttons where they fit, and
	// a native select below `collapseBelow` pixels of screen width, where the
	// buttons would wrap or crowd the chart's title. Both are rendered and a
	// media query shows one, so the server renders the right one and nothing
	// jumps when the page starts; the hidden one is display: none, out of the
	// tab order and the accessibility tree.

	const uid = $props.id();

	let {
		options,
		value = $bindable(),
		label,
		collapseBelow = 480,
		onchange,
		class: extraClass = ''
	}: {
		options: RangeOption<Value>[];
		/** The selected option's value. */
		value?: Value;
		/** Names the button group and the select: "Chart range". */
		label: string;
		/** Below this screen width, in pixels, a select shows instead of the buttons; 0 never. */
		collapseBelow?: number;
		onchange?: (value: Value) => void;
		class?: string;
	} = $props();

	const query = $derived(collapseQuery(collapseBelow));
	const selectedIndex = $derived(selectedOptionIndex(options, value));
	// Only the picker's own id and a number go into the rule, so it cannot carry markup.
	const collapseStyle = $derived(
		query
			? `<style>@media ${query}{[data-sui-range="${uid}"]>.wide{display:none!important}[data-sui-range="${uid}"]>.narrow{display:inline-flex!important}}</style>`
			: ''
	);

	// Zooming or resizing across the width hides the control that has focus;
	// focus then moves to the one shown (WCAG 2.4.3).
	let picker = $state<HTMLElement>();
	$effect(() => {
		if (!query || !picker) return;
		const element = picker;
		const media = window.matchMedia(query);
		// Hiding the focused control drops focus to the page without a related target, so remember it was inside.
		let inside = element.contains(document.activeElement);
		const focusIn = () => (inside = true);
		const focusOut = (event: FocusEvent) => {
			if (event.relatedTarget) inside = element.contains(event.relatedTarget as Node);
		};
		const moveFocus = () => {
			const active = document.activeElement;
			if (!inside || (active && active !== document.body && !element.contains(active))) return;
			const shown = media.matches ? element.querySelector<HTMLElement>('.narrow select') : element.querySelector<HTMLElement>('.wide button[aria-pressed="true"], .wide button:not(:disabled)');
			shown?.focus();
		};
		media.addEventListener('change', moveFocus);
		element.addEventListener('focusin', focusIn);
		element.addEventListener('focusout', focusOut);
		return () => {
			media.removeEventListener('change', moveFocus);
			element.removeEventListener('focusin', focusIn);
			element.removeEventListener('focusout', focusOut);
		};
	});

	function select(next: Value) {
		value = next;
		onchange?.(next);
	}

	function onSelectChange(event: Event) {
		const option = optionForSelectValue(options, (event.currentTarget as HTMLSelectElement).value);
		if (option) select(option.value);
	}
</script>

{@html collapseStyle}
<div class="sui-range-picker {extraClass}" data-sui-range={uid} bind:this={picker}>
	<span class="wide">
		<SegmentedControl {label} {options} value={selectedIndex === -1 ? undefined : value} onchange={select} />
	</span>
	<span class="narrow">
		<Select aria-label={label} value={selectedIndex === -1 ? '' : String(selectedIndex)} onchange={onSelectChange}>
			{#if selectedIndex === -1}
				<option value="" disabled>--</option>
			{/if}
			{#each options as option, index (index)}
				<option value={String(index)} disabled={option.disabled}>{option.label}</option>
			{/each}
		</Select>
	</span>
</div>

<style>
	.sui-range-picker {
		display: inline-flex;
		min-width: 0;
	}
	.wide {
		display: inline-flex;
	}
	.narrow {
		display: none;
	}
</style>
