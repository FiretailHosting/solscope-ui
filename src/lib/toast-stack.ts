// Stacks every mounted Toast. Each toast is fixed at the same anchor, so on
// their own two of them paint over each other. The registry keeps the toasts
// in mount order, measures their heights with one ResizeObserver and gives
// each one its offset from the anchor: the newest sits at the anchor and the
// older ones are pushed up above it, a gap apart. It also publishes the
// stack's height on <html> as --toast-stack-height, so a page can add it to
// its scroll padding and keep an element scrolled into view clear of the
// toasts. The property is removed when no toast is mounted.

/** The custom property on `<html>` that holds the stack's height, in px. */
export const toastStackHeightProperty = '--toast-stack-height';

// Each toast's distance from the anchor, read by its own CSS.
const toastOffsetProperty = '--sui-toast-stack-offset';

// Newest last.
const mountedToasts: HTMLElement[] = [];
let observer: ResizeObserver | undefined;

// The gap between toasts, 0.5rem like the gap inside one, so it follows the
// user's text size.
function gapPx(): number {
	const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
	return (Number.isFinite(rootFontSize) && rootFontSize > 0 ? rootFontSize : 16) / 2;
}

function layout() {
	const root = document.documentElement;
	if (mountedToasts.length === 0) {
		root.style.removeProperty(toastStackHeightProperty);
		return;
	}
	const gap = gapPx();
	let offset = 0;
	for (let index = mountedToasts.length - 1; index >= 0; index -= 1) {
		const toast = mountedToasts[index];
		toast.style.setProperty(toastOffsetProperty, `${offset}px`);
		offset += toast.offsetHeight + gap;
	}
	// The toasts' heights plus a gap for each, so the top one has room above it.
	root.style.setProperty(toastStackHeightProperty, `${offset}px`);
}

/** Adds a mounted toast to the stack and returns the function that removes it. */
export function stackToast(toast: HTMLElement): () => void {
	if (typeof document === 'undefined') return () => {};
	// A toast mounts empty and fills a frame later, and its text may wrap as
	// the window or the text size changes: the observer keeps the offsets right.
	observer ??= new ResizeObserver(layout);
	mountedToasts.push(toast);
	observer.observe(toast);
	layout();
	let removed = false;
	return () => {
		if (removed) return;
		removed = true;
		observer?.unobserve(toast);
		toast.style.removeProperty(toastOffsetProperty);
		const index = mountedToasts.indexOf(toast);
		if (index !== -1) mountedToasts.splice(index, 1);
		layout();
	};
}
