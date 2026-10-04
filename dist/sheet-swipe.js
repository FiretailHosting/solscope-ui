// Swipe down to close a Dialog shown as a bottom sheet on phones. Kept
// apart from the component so the gesture's rules can be tested without a
// page.
/** How far a finger moves before the gesture counts as a swipe or not. */
export const SHEET_SWIPE_DECIDE_PX = 10;
/** A swipe down must be this much more vertical than horizontal. */
const VERTICAL_RATIO = 1.5;
/** A release this fast, in pixels a millisecond, closes however far it went. */
const FLICK_SPEED = 0.5;
/** The share of the sheet's height a slow drag must cover to close it. */
const CLOSE_SHARE = 0.25;
/** A slow drag this far always closes, so a tall sheet needs no long pull. */
const CLOSE_MAX_PX = 160;
/**
 * Whether a gesture that has moved dx, dy from where it started is a swipe
 * down: clearly downward and more vertical than horizontal, so a slider
 * dragged sideways or a tap is not. null while it has not moved far enough
 * to tell.
 */
export function isSheetSwipe(dx, dy) {
    if (Math.abs(dx) <= SHEET_SWIPE_DECIDE_PX && Math.abs(dy) <= SHEET_SWIPE_DECIDE_PX)
        return null;
    return dy > SHEET_SWIPE_DECIDE_PX && dy >= Math.abs(dx) * VERTICAL_RATIO;
}
/**
 * Whether a swipe down released after pulling the sheet distance pixels, at
 * speed pixels a millisecond (positive downward), closes a sheet height
 * pixels tall: a quick flick down, or a pull of a quarter of the sheet,
 * capped at CLOSE_MAX_PX.
 */
export function closesSheet(distance, speed, height) {
    if (distance <= 0)
        return false;
    if (speed >= FLICK_SPEED)
        return true;
    return distance >= Math.min(CLOSE_MAX_PX, height * CLOSE_SHARE);
}
