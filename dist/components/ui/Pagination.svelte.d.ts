type $$ComponentProps = {
    /**
     * The page currently shown, starting at 1. Update it when the new rows
     * arrive, not when the request starts, and use `disabled` to cover the
     * load, so "Page 3 of 14" is announced when the rows land.
     */
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
