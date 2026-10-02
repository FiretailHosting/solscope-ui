// Locks the page scroll while a drawer or a modal dialog is open, counted so
// nested overlays (a Dialog over the Sidebar) release it only when the last
// one closes. The CSS in globals.css does the work: under the phone query the
// body is pinned at its scroll position, so a touch cannot move the page;
// in a narrow window with a mouse only the overflow is hidden, with the
// scrollbar's width kept as padding so nothing shifts; on a wide screen the
// class has no effect.

import { PHONE_QUERY } from './phone.js';

export const scrollLockClass = 'sui-scroll-locked';

let lockCount = 0;
let lockedScrollY = 0;
let pinned = false;
let phone: MediaQueryList | undefined;

// A pinned body sits at a fixed offset, so the page's own scroll position
// is gone until it is put back.
function pin() {
	lockedScrollY = window.scrollY;
	document.documentElement.style.setProperty('--sui-scroll-lock-top', `${-lockedScrollY}px`);
	pinned = true;
}

function unpin() {
	if (!pinned) return;
	pinned = false;
	document.documentElement.style.removeProperty('--sui-scroll-lock-top');
	window.scrollTo({ top: lockedScrollY, left: window.scrollX, behavior: 'instant' });
}

// Rotating or resizing across the phone query while locked pins or unpins
// the body; either way the page stays where the user left it.
function followPhone(event: MediaQueryListEvent) {
	if (event.matches) pin();
	else unpin();
}

/** Locks the page scroll and returns the function that releases this lock. */
export function lockScroll(): () => void {
	if (typeof document === 'undefined') return () => {};
	if (lockCount === 0) {
		phone ??= window.matchMedia(PHONE_QUERY);
		// The width of a classic scrollbar, or 0 for an overlay one.
		const gutter = window.innerWidth - document.documentElement.clientWidth;
		document.documentElement.style.setProperty('--sui-scroll-lock-gutter', `${gutter}px`);
		if (phone.matches) pin();
		document.documentElement.classList.add(scrollLockClass);
		phone.addEventListener('change', followPhone);
	}
	lockCount += 1;
	let released = false;
	return () => {
		if (released) return;
		released = true;
		lockCount -= 1;
		if (lockCount > 0) return;
		phone?.removeEventListener('change', followPhone);
		document.documentElement.classList.remove(scrollLockClass);
		document.documentElement.style.removeProperty('--sui-scroll-lock-gutter');
		unpin();
	};
}
