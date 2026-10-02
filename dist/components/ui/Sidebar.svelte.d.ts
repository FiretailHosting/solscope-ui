import type { Snippet } from 'svelte';
type $$ComponentProps = {
    /** Whether the sidebar is shown on narrow screens. It is always shown on wide ones. */
    open?: boolean;
    /** Accessible name of the close button shown in the drawer on narrow screens. */
    closeLabel?: string;
    class?: string;
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet;
};
declare const Sidebar: import("svelte").Component<$$ComponentProps, {}, "open">;
type Sidebar = ReturnType<typeof Sidebar>;
export default Sidebar;
