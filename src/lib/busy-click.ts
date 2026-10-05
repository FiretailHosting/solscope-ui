// What a Button does with a press while its action runs, kept apart from the
// component so it can be tested without a browser.

/**
 * stopBusyClick swallows a press on a busy control: no handler runs, a submit
 * button does not submit its form again, a link does not follow, and the
 * press goes no further up the page, much as with a disabled button.
 * It says whether it swallowed the press. A busy control stays enabled, so
 * it keeps focus while it waits instead of dropping it to the page.
 */
export function stopBusyClick(event: Pick<Event, 'preventDefault' | 'stopImmediatePropagation'>, busy: boolean): boolean {
	if (!busy) return false;
	event.preventDefault();
	event.stopImmediatePropagation();
	return true;
}
