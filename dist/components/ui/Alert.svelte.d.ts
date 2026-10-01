import type { Snippet } from 'svelte';
type Variant = 'default' | 'error' | 'up' | 'warn';
type $$ComponentProps = {
    variant?: Variant;
    /**
     * Defaults to alert for errors, which screen readers announce at once,
     * and status for everything else, which waits its turn.
     */
    role?: string;
    class?: string;
    children?: Snippet;
};
declare const Alert: import("svelte").Component<$$ComponentProps, {}, "">;
type Alert = ReturnType<typeof Alert>;
export default Alert;
