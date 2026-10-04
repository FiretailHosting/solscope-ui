import type { Snippet } from 'svelte';
type $$ComponentProps = {
    label: string;
    /** A tooltip for the value, such as its full precision. */
    title?: string;
    /** The value is loading; put a Skeleton in its place. */
    busy?: boolean;
    class?: string;
    /** Sits at the end of the row: Max, Deposit, Retry. */
    action?: Snippet;
    /** The value. */
    children?: Snippet;
};
declare const Balance: import("svelte").Component<$$ComponentProps, {}, "">;
type Balance = ReturnType<typeof Balance>;
export default Balance;
