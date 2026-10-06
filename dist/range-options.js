// How RangePicker maps its options to the native select it shows on narrow
// screens, where every value is a string: by position, so option values can
// be numbers, such as days, or anything else.
/** selectedOptionIndex is the position of the option with this value, or -1 when none has it. */
export function selectedOptionIndex(options, value) {
    return options.findIndex((option) => option.value === value);
}
/** optionForSelectValue is the option a select's value, its position as text, stands for, unless it is missing or disabled. */
export function optionForSelectValue(options, selectValue) {
    if (!/^\d+$/.test(selectValue))
        return undefined;
    const option = options[Number(selectValue)];
    return option && !option.disabled ? option : undefined;
}
/** collapseQuery is the media query under which the picker shows a select, or null when it never does. */
export function collapseQuery(collapseBelow) {
    if (!Number.isFinite(collapseBelow) || collapseBelow <= 0)
        return null;
    return `(max-width: ${Math.round(collapseBelow) - 0.02}px)`;
}
/**
 * rangeButtonsFit says the picker's buttons fit the space it is given: they
 * sit on one row, as a row that runs out of room wraps, and none of them
 * reaches past the space's edges. Half a pixel of slack absorbs rounding.
 */
export function rangeButtonsFit(buttons, space) {
    if (buttons.length === 0)
        return true;
    const top = buttons[0].top;
    return buttons.every((button) => Math.abs(button.top - top) < 1 && button.left >= space.left - 0.5 && button.right <= space.right + 0.5);
}
