/** One choice of a RangePicker or SegmentedControl; the same shape as SegmentedOption. */
export type RangeOption<Value> = {
    value: Value;
    label: string;
    disabled?: boolean;
};
/** selectedOptionIndex is the position of the option with this value, or -1 when none has it. */
export declare function selectedOptionIndex<Value>(options: RangeOption<Value>[], value: Value | undefined): number;
/** optionForSelectValue is the option a select's value, its position as text, stands for, unless it is missing or disabled. */
export declare function optionForSelectValue<Value>(options: RangeOption<Value>[], selectValue: string): RangeOption<Value> | undefined;
/** collapseQuery is the media query under which the picker shows a select, or null when it never does. */
export declare function collapseQuery(collapseBelow: number): string | null;
/** Where a button, or the space the buttons have, sits on the page, in pixels. */
export type RangeBox = {
    top: number;
    left: number;
    right: number;
};
/**
 * rangeButtonsFit says the picker's buttons fit the space it is given: they
 * sit on one row, as a row that runs out of room wraps, and none of them
 * reaches past the space's edges. Half a pixel of slack absorbs rounding.
 */
export declare function rangeButtonsFit(buttons: readonly RangeBox[], space: Omit<RangeBox, 'top'>): boolean;
