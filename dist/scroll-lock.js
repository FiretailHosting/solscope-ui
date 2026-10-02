// Locks the page scroll while a drawer or a modal dialog is open, counted so
// nested overlays (a Dialog over the Sidebar) release it only when the last
// one closes. The CSS under 860px in globals.css does the pinning; on wide
// screens the class has no effect, so a scrollbar never makes the page shift.
export const scrollLockClass = 'sui-scroll-locked';
let lockCount = 0;
let lockedScrollY = 0;
/** Locks the page scroll and returns the function that releases this lock. */
export function lockScroll() {
    if (typeof document === 'undefined')
        return () => { };
    if (lockCount === 0) {
        lockedScrollY = window.scrollY;
        document.documentElement.style.setProperty('--sui-scroll-lock-top', `${-lockedScrollY}px`);
        document.documentElement.classList.add(scrollLockClass);
    }
    lockCount += 1;
    let released = false;
    return () => {
        if (released)
            return;
        released = true;
        lockCount -= 1;
        if (lockCount > 0)
            return;
        // Only a pinned body lost its scroll position. On a wide screen the
        // page could scroll under a modal, and must stay where the user left it.
        const wasPinned = getComputedStyle(document.body).position === 'fixed';
        document.documentElement.classList.remove(scrollLockClass);
        document.documentElement.style.removeProperty('--sui-scroll-lock-top');
        if (wasPinned)
            window.scrollTo({ top: lockedScrollY, left: window.scrollX, behavior: 'instant' });
    };
}
