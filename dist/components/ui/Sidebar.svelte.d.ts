import type { Snippet } from 'svelte';
type $$ComponentProps = {
    open?: boolean;
    class?: string;
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet;
};
declare const Sidebar: import("svelte").Component<$$ComponentProps, {}, "open">;
type Sidebar = ReturnType<typeof Sidebar>;
export default Sidebar;
