import type { Snippet } from 'svelte';
type Variant = 'default' | 'up' | 'down' | 'accent';
type $$ComponentProps = {
    variant?: Variant;
    class?: string;
    children?: Snippet;
};
declare const Badge: import("svelte").Component<$$ComponentProps, {}, "">;
type Badge = ReturnType<typeof Badge>;
export default Badge;
