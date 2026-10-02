import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** One line of text, or a snippet. */
    message: string | Snippet;
    /** Label of the action button; without one there is no action. */
    actionLabel?: string;
    onaction?: () => void;
    /**
     * The action is running: its button is aria-busy and ignores presses,
     * so a second tap does nothing. It is never disabled, so it keeps focus.
     */
    actionBusy?: boolean;
    /** The action button's label while `actionBusy`; the action label otherwise. */
    busyLabel?: string;
    /** Accessible name of the dismiss button. */
    dismissLabel?: string;
    /**
     * Called by the dismiss button and by Escape; without it there is no
     * dismiss button. Focus then goes back to the element that had it before
     * focus entered the toast, or to `main` when there was none.
     */
    ondismiss?: () => void;
    /** How the message is announced: polite waits its turn, off says nothing. */
    live?: 'polite' | 'off';
}
declare const Toast: import("svelte").Component<Props, {}, "">;
type Toast = ReturnType<typeof Toast>;
export default Toast;
