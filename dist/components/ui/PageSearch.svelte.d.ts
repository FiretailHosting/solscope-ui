import { type PageSearchItem, type PageSearchSection } from '../../page-search.js';
type $$ComponentProps = {
    /** Shown while true. Bind it; open it with `show()` from a tap, so iOS raises the keyboard. */
    open?: boolean;
    /** What is typed; bind it to search `sections` as it changes. It empties on each opening. */
    query?: string;
    /** The ids of the sections the user closed, `'pages'` for the pages; bind it to keep them closed across reloads. */
    closedSections?: string[];
    /** Every page that can be reached, each with a unique href, in the order they are offered with nothing typed. */
    pages: PageSearchItem[];
    /**
     * Result sections under the pages, such as coins. Given, even empty,
     * the pages become a section too and each section a disclosure that
     * can be closed.
     */
    sections?: PageSearchSection[];
    /** At most this many pages once something is typed; all of them with nothing typed. */
    pageLimit?: number;
    /** Heading of the pages section. */
    pagesTitle?: string;
    /** Shown in a section with no results. */
    noMatchesText?: string;
    /** The sheet's heading, which names the dialog; use the opening button's name. */
    title?: string;
    /** Accessible name of the search field. */
    fieldLabel?: string;
    placeholder?: string;
    /** The most characters the field takes; no limit by default. */
    maxlength?: number;
    /** Without `sections`: shown, and read out, when nothing matches. */
    emptyText?: string;
    /** Called once the sheet has closed, however it closed. */
    onclose?: () => void;
};
declare const PageSearch: import("svelte").Component<$$ComponentProps, {
    show: () => void;
}, "open" | "query" | "closedSections">;
type PageSearch = ReturnType<typeof PageSearch>;
export default PageSearch;
