import type { Snippet } from 'svelte';
type $$ComponentProps = {
    /**
     * Highlights the row under the pointer. Turn it off when rows are not
     * clickable, so the highlight does not suggest that they are.
     */
    rowHover?: boolean;
    class?: string;
    children?: Snippet;
};
declare const Table: import("svelte").Component<$$ComponentProps, {}, "">;
type Table = ReturnType<typeof Table>;
export default Table;
