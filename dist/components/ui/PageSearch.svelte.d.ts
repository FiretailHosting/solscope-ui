import { type PageSearchItem } from '../../page-search.js';
type $$ComponentProps = {
    /** Shown while true. Bind it; open it with `show()` from a tap, so iOS raises the keyboard. */
    open?: boolean;
    /** Every page that can be reached, each with a unique href, in the order they are offered with nothing typed. */
    pages: PageSearchItem[];
    /** The sheet's heading, which names the dialog; use the opening button's name. */
    title?: string;
    /** Accessible name of the search field. */
    fieldLabel?: string;
    placeholder?: string;
    /** Shown, and read out, when nothing matches. */
    emptyText?: string;
    /** Called once the sheet has closed, however it closed. */
    onclose?: () => void;
};
declare const PageSearch: import("svelte").Component<$$ComponentProps, {
    show: () => void;
}, "open">;
type PageSearch = ReturnType<typeof PageSearch>;
export default PageSearch;
