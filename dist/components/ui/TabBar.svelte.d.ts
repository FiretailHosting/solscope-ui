import type { IconName } from '../../icons/icons.js';
export type TabBarItem = {
    href: string;
    /** One word; the bar has room for two short lines at most. */
    label: string;
    icon: IconName;
    /**
     * Marks the item for the page shown, with the active look and
     * aria-current: `true` or `'page'` when the item is that exact page,
     * `'section'` when the page lives inside the item's section, such as
     * one market under Markets, which is `aria-current="true"`.
     */
    active?: boolean | 'page' | 'section';
    /** An unread count, shown as a badge and read out. */
    badge?: number;
};
type $$ComponentProps = {
    /** The main destinations: four or five fit; the drawer holds the rest. */
    items: TabBarItem[];
    /** Accessible name of the navigation landmark, distinct from the sidebar's. */
    label?: string;
    /** Label of the More item, which opens the drawer; rendered only when `onmore` is set. */
    moreLabel?: string;
    moreIcon?: IconName;
    /** A count carried over from items that live in the drawer, such as the Inbox. */
    moreBadge?: number;
    /** Whether the drawer is open, for aria-expanded on the More item. */
    moreOpen?: boolean;
    /**
     * Gives More the active look when the page shown is not one of the items.
     * It is a menu button, not the page, so it carries no aria-current: the
     * drawer's own item marks the page.
     */
    moreActive?: boolean;
    /** The id of the drawer More opens, for aria-controls. */
    moreControls?: string;
    /** Opens the drawer; the Sidebar's `open` is the app's to set. */
    onmore?: () => void;
    class?: string;
};
declare const TabBar: import("svelte").Component<$$ComponentProps, {}, "">;
type TabBar = ReturnType<typeof TabBar>;
export default TabBar;
