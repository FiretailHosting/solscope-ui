import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** The question, in bold; it takes focus when the panel opens and names the group. */
    question: string | Snippet;
    /** What the action does, after the question. */
    detail?: string | Snippet;
    confirmLabel?: string;
    cancelLabel?: string;
    /** The confirm button's label while `busy`; the confirm label otherwise. */
    busyLabel?: string;
    /** A danger-styled confirm button, for an action that cannot be undone. */
    danger?: boolean;
    /**
     * The action is running: the group says so with aria-busy, and both
     * buttons are aria-disabled and ignore presses, so a second tap does
     * nothing and Escape does not back out.
     */
    busy?: boolean;
    /**
     * The control focus goes back to after Cancel: an element, or a
     * function that finds one, for a button the app re-renders. Without
     * it, the element that had focus when the panel opened.
     */
    trigger?: HTMLElement | (() => HTMLElement | null | undefined);
    onconfirm: () => void;
    oncancel: () => void;
    /** More content between the question and the buttons. */
    children?: Snippet;
}
declare const InlineConfirm: import("svelte").Component<Props, {}, "">;
type InlineConfirm = ReturnType<typeof InlineConfirm>;
export default InlineConfirm;
