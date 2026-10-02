import type { IconName } from '../../icons/icons.js';
export type TabBarItem = {
    href: string;
    /** One word; the bar has no room for more. */
    label: string;
    icon: IconName;
    /** Marks the item for the page shown, with aria-current. */
    active?: boolean;
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
    /** Marks More for the page shown, with aria-current, when the page is not one of the items. */
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
