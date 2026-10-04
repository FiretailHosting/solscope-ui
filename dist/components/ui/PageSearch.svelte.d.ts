import { type PageSearchItem } from '../../page-search.js';
type $$ComponentProps = {
    /** Shown while true; bind it, and set it from the button that opens the search. */
    open?: boolean;
    /** Every page that can be reached, in the order they are offered with nothing typed. */
    pages: PageSearchItem[];
    /** The sheet's heading, which names the dialog. */
    title?: string;
    /** Accessible name of the search field. */
    fieldLabel?: string;
    placeholder?: string;
    /** Shown, and read out, when nothing matches. */
    emptyText?: string;
    /** Called once the sheet has closed, however it closed. */
    onclose?: () => void;
};
declare const PageSearch: import("svelte").Component<$$ComponentProps, {}, "open">;
type PageSearch = ReturnType<typeof PageSearch>;
export default PageSearch;
