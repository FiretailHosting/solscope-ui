import type { Snippet } from 'svelte';
type $$ComponentProps = {
    /** The most columns; fewer when they would be narrower than minWidth. */
    cols?: number;
    minWidth?: string;
    class?: string;
    children?: Snippet;
};
declare const Grid: import("svelte").Component<$$ComponentProps, {}, "">;
type Grid = ReturnType<typeof Grid>;
export default Grid;
