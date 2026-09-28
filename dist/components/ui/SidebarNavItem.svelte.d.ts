import type { Snippet } from 'svelte';
import type { IconName } from '../../icons/icons.js';
type $$ComponentProps = {
    href?: string;
    active?: boolean;
    badge?: number;
    icon?: IconName;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
};
declare const SidebarNavItem: import("svelte").Component<$$ComponentProps, {}, "">;
type SidebarNavItem = ReturnType<typeof SidebarNavItem>;
export default SidebarNavItem;
