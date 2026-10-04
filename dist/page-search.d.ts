import type { IconName } from './icons/icons.js';
export type PageSearchItem = {
    href: string;
    label: string;
    icon: IconName;
    /** The group the page sits in, such as a sidebar section; shown beside it and searched too. */
    section?: string;
    /**
     * Marks the page shown, as TabBar items do: `true` or `'page'` for that
     * exact page, `'section'` when the page shown lives under it, such as one
     * market under Markets.
     */
    active?: boolean | 'page' | 'section';
    /** An unread count, shown beside the page and read out. */
    badge?: number;
};
export declare function filterPages<Page extends PageSearchItem>(pages: readonly Page[], query: string): Page[];
