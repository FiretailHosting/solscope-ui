import type { Snippet } from 'svelte';
import type { HTMLDialogAttributes } from 'svelte/elements';
type Size = 'default' | 'lg';
interface Props extends Omit<HTMLDialogAttributes, 'open' | 'title' | 'onclose'> {
    /**
     * Shown while true. It opens as a modal when mounted, so a dialog the
     * app renders inside an `{#if}` needs nothing more; bind it to keep
     * the dialog mounted and open it later.
     */
    open?: boolean;
    /** The heading, as text or a snippet; it names the dialog. */
    title?: string | Snippet;
    /** Accessible name when there is no title. */
    label?: string;
    /** default is a 26rem card, lg a 42rem one. Both fill the screen width on phones. */
    size?: Size;
    /** Accessible name of the close button. */
    closeLabel?: string;
    /** Whether a tap on the backdrop closes the dialog. */
    closeOnBackdrop?: boolean;
    /** Called once the dialog has closed, however it closed. */
    onclose?: () => void;
    /** A row of actions under the content. */
    footer?: Snippet;
    children?: Snippet;
}
declare const Dialog: import("svelte").Component<Props, {}, "open">;
type Dialog = ReturnType<typeof Dialog>;
export default Dialog;
