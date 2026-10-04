/** How far a finger moves before the gesture counts as a swipe or not. */
export declare const SHEET_SWIPE_DECIDE_PX = 10;
/**
 * Whether a gesture that has moved dx, dy from where it started is a swipe
 * down: clearly downward and more vertical than horizontal, so a slider
 * dragged sideways or a tap is not. null while it has not moved far enough
 * to tell.
 */
export declare function isSheetSwipe(dx: number, dy: number): boolean | null;
/**
 * Whether a swipe down released after pulling the sheet distance pixels, at
 * speed pixels a millisecond (positive downward), closes a sheet height
 * pixels tall: a quick flick down, or a pull of a quarter of the sheet,
 * capped at CLOSE_MAX_PX.
 */
export declare function closesSheet(distance: number, speed: number, height: number): boolean;
