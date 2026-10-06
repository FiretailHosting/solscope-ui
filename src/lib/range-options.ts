// How RangePicker maps its options to the native select it shows on narrow
// screens, where every value is a string: by position, so option values can
// be numbers, such as days, or anything else.

/** One choice of a RangePicker or SegmentedControl; the same shape as SegmentedOption. */
export type RangeOption<Value> = { value: Value; label: string; disabled?: boolean };

/** selectedOptionIndex is the position of the option with this value, or -1 when none has it. */
export function selectedOptionIndex<Value>(options: RangeOption<Value>[], value: Value | undefined): number {
	return options.findIndex((option) => option.value === value);
}

/** optionForSelectValue is the option a select's value, its position as text, stands for, unless it is missing or disabled. */
export function optionForSelectValue<Value>(options: RangeOption<Value>[], selectValue: string): RangeOption<Value> | undefined {
	if (!/^\d+$/.test(selectValue)) return undefined;
	const option = options[Number(selectValue)];
	return option && !option.disabled ? option : undefined;
}

/** collapseQuery is the media query under which the picker shows a select, or null when it never does. */
export function collapseQuery(collapseBelow: number): string | null {
	if (!Number.isFinite(collapseBelow) || collapseBelow <= 0) return null;
	return `(max-width: ${Math.round(collapseBelow) - 0.02}px)`;
}

/** Where a button, or the space the buttons have, sits on the page, in pixels. */
export type RangeBox = { top: number; left: number; right: number };

/**
 * rangeButtonsFit says the picker's buttons fit the space it is given: they
 * sit on one row, as a row that runs out of room wraps, and none of them
 * reaches past the space's edges. Half a pixel of slack absorbs rounding.
 */
export function rangeButtonsFit(buttons: readonly RangeBox[], space: Omit<RangeBox, 'top'>): boolean {
	if (buttons.length === 0) return true;
	const top = buttons[0].top;
	return buttons.every(
		(button) => Math.abs(button.top - top) < 1 && button.left >= space.left - 0.5 && button.right <= space.right + 0.5
	);
}
