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
/** One result of a section the app searches itself, such as coins. */
export type PageSearchResult = {
    href: string;
    label: string;
    /** Smaller text after the label, such as a symbol. */
    detail?: string;
    /** Shown at the end of the row, such as a price. */
    value?: string;
    /** Read out before the value, such as "Price". */
    valueLabel?: string;
    /** A small round image before the label, such as a token icon; an empty circle keeps the rows aligned without one. */
    image?: string;
};
/** A result section under the pages, which the app fills as `query` changes. */
export type PageSearchSection = {
    /** Unique and stable: a closed section stays closed by it. */
    id: string;
    title: string;
    results: PageSearchResult[];
    /** Results are on their way: skeleton rows show and the count waits. */
    loading?: boolean;
    /** Fixed text shown instead of results when the search failed; never a raw server error. */
    error?: string;
    /** Shown when there are no results; the sheet's `noMatchesText` otherwise. */
    emptyText?: string;
    /** Singular and plural for the count read out, such as ['coin', 'coins']. */
    noun?: [string, string];
};
/** What the count read-out needs to know about a section. */
export type PageSearchSummaryPart = {
    count: number;
    noun: [string, string];
    loading?: boolean;
    error?: string;
};
/** "1 page", "3 pages" or "no pages". */
export declare function countPhrase(count: number, [one, other]: [string, string]): string;
export declare function searchSummary(parts: readonly PageSearchSummaryPart[]): string;
