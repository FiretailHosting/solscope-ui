import type { Snippet } from 'svelte';
type Variant = 'default' | 'error' | 'up';
type $$ComponentProps = {
    variant?: Variant;
    role?: string;
    class?: string;
    children?: Snippet;
};
declare const Alert: import("svelte").Component<$$ComponentProps, {}, "">;
type Alert = ReturnType<typeof Alert>;
export default Alert;
