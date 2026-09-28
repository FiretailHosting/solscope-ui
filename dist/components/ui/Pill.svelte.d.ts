import type { Snippet } from 'svelte';
type Variant = 'default' | 'live' | 'ok';
type $$ComponentProps = {
    variant?: Variant;
    class?: string;
    children?: Snippet;
};
declare const Pill: import("svelte").Component<$$ComponentProps, {}, "">;
type Pill = ReturnType<typeof Pill>;
export default Pill;
