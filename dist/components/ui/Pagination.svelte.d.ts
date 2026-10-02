type $$ComponentProps = {
    /** The current page, starting at 1. */
    page: number;
    totalItems: number;
    perPage: number;
    /** Called with the page the user asked for; the app updates `page`. */
    onpage?: (page: number) => void;
    /** Accessible name for the navigation landmark. */
    label?: string;
    /** Blocks both buttons, for example while the next page loads. */
    disabled?: boolean;
    class?: string;
};
declare const Pagination: import("svelte").Component<$$ComponentProps, {}, "">;
type Pagination = ReturnType<typeof Pagination>;
export default Pagination;
