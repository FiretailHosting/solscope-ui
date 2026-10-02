import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
    /** Makes the row, apart from `actions`, one link. */
    href?: string;
    /** The first line: the name, with an avatar or a symbol beside it. */
    children?: Snippet;
    /** The second line under the name, muted: a status, an email, a note. */
    detail?: string | Snippet;
    /** The first line's right-hand cell, such as a price or a value. */
    value?: string | Snippet;
    /** Read before a bare `value`, such as "Value", so a number is not read alone. */
    valueLabel?: string;
    /** The second line's right-hand cell, muted, such as a change. */
    note?: string | Snippet;
    /** Read before a bare `note`, such as "Return". */
    noteLabel?: string;
    /** Controls at the end of the row, outside the link. */
    actions?: Snippet;
}
declare const RowItem: import("svelte").Component<Props, {}, "">;
type RowItem = ReturnType<typeof RowItem>;
export default RowItem;
