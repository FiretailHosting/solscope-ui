import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type ChartConfig } from './chart-utils.js';
type $$ComponentProps = HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    /** Series names and colours, keyed by series key. */
    config: ChartConfig;
    class?: string;
    children?: Snippet;
};
declare const ChartContainer: import("svelte").Component<$$ComponentProps, {}, "ref">;
type ChartContainer = ReturnType<typeof ChartContainer>;
export default ChartContainer;
