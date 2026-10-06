<script lang="ts" generics="Value">
	import { collapseQuery, optionForSelectValue, rangeButtonsFit, selectedOptionIndex, type RangeOption } from '../../range-options.js';
	import SegmentedControl from './SegmentedControl.svelte';
	import Select from './Select.svelte';

	// A chart's range, such as 1H to 1Y: segmented buttons where they fit the
	// space the picker is given, and a native select where they do not, or
	// below `collapseBelow` pixels of screen width. Both sit in one grid cell,
	// so the picker keeps one width and height whichever shows: the buttons
	// always take their row's width, wrapping where the space runs out, and a
	// wrapped row is what collapses the picker. The select shows until the
	// buttons are measured, so they never overflow on first paint. The hidden
	// one is visibility: hidden, out of the tab order and the accessibility tree.

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
		/** Below this screen width, in pixels, the select shows even where the buttons fit; 0 never. */
		collapseBelow?: number;
		onchange?: (value: Value) => void;
		class?: string;
	} = $props();

	const query = $derived(collapseQuery(collapseBelow));
	const selectedIndex = $derived(selectedOptionIndex(options, value));
	// Only the picker's own id and a number go into the rule, so it cannot carry markup.
	const collapseStyle = $derived(
		query
			? `<style>@media ${query}{[data-sui-range="${uid}"]>.wide{visibility:hidden!important;height:0!important;overflow:hidden!important}[data-sui-range="${uid}"]>.narrow{visibility:visible!important}}</style>`
			: ''
	);

	let picker = $state<HTMLElement>();
	// Whether the buttons fit the picker's space, once measured.
	let fits = $state(false);
	let narrowScreen = $state(false);
	const collapsed = $derived(!fits || narrowScreen);

	// Measures the buttons on every change of the space or of their own size,
	// as when the card narrows, a font loads or the text grows.
	$effect(() => {
		if (!picker) return;
		const element = picker;
		const wide = element.querySelector<HTMLElement>('.wide');
		const group = wide?.firstElementChild as HTMLElement | null;
		if (!wide || !group) return;
		const measure = () => {
			const space = wide.getBoundingClientRect();
			const buttons = [...group.querySelectorAll('button')].map((button) => button.getBoundingClientRect());
			fits = rangeButtonsFit(buttons, space);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		observer.observe(group);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!query) {
			narrowScreen = false;
			return;
		}
		const media = window.matchMedia(query);
		const update = () => (narrowScreen = media.matches);
		update();
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	});

	// Switching hides the control that has focus; focus then moves to the one
	// shown (WCAG 2.4.3). Hiding it drops focus to the page without a related
	// target, so remember it was inside.
	let focusInside = false;
	function onFocusIn() {
		focusInside = true;
	}
	function onFocusOut(event: FocusEvent) {
		if (event.relatedTarget) focusInside = picker?.contains(event.relatedTarget as Node) ?? false;
	}
	$effect(() => {
		const showSelect = collapsed;
		if (!picker || !focusInside) return;
		const active = document.activeElement;
		if (active && active !== document.body && !picker.contains(active)) return;
		const shown = showSelect
			? picker.querySelector<HTMLElement>('.narrow select')
			: (picker.querySelector<HTMLElement>('.wide button[aria-pressed="true"]') ?? picker.querySelector<HTMLElement>('.wide button:not(:disabled)'));
		if (shown && shown !== active) shown.focus();
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
<div
	class="sui-range-picker {extraClass}"
	data-sui-range={uid}
	data-fit={fits ? 'yes' : undefined}
	bind:this={picker}
	onfocusin={onFocusIn}
	onfocusout={onFocusOut}
>
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
	/* One cell for both, so the picker is as wide as the wider of the two
	   and as tall as the taller, in both states. It shrinks with the space
	   it is given, down to the widest button or the select. */
	.sui-range-picker {
		display: inline-grid;
		align-items: center;
		min-width: 0;
		max-width: 100%;
	}
	/* --sui-range-picker-justify puts the select at the end of a picker given
	   more room than it shows, as in a Card's header. */
	.wide,
	.narrow {
		grid-area: 1 / 1;
		min-width: 0;
		justify-self: var(--sui-range-picker-justify, start);
	}
	.wide {
		display: flex;
		max-width: 100%;
		visibility: hidden;
		height: 0;
		overflow: hidden;
	}
	/* The row wraps where it runs out of room, which is what collapses the
	   picker; a button's own label never wraps. */
	.wide :global(.sui-segmented) {
		flex-wrap: wrap;
		min-width: 0;
	}
	.wide :global(.sui-segmented button) {
		white-space: nowrap;
	}
	.narrow {
		display: inline-flex;
	}
	[data-fit='yes'] > .wide {
		visibility: visible;
		height: auto;
		overflow: visible;
	}
	[data-fit='yes'] > .narrow {
		visibility: hidden;
	}
</style>
