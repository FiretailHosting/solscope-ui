import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type TooltipPayload } from './chart-utils.js';
type $$ComponentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    ref?: HTMLDivElement | null;
    class?: string;
    hideLabel?: boolean;
    /** A series key from the config, or literal text, shown as the heading. */
    label?: string;
    indicator?: 'line' | 'dot' | 'dashed';
    /** The data field or config key that names each row. */
    nameKey?: string;
    /** The data field or config key used for the heading. */
    labelKey?: string;
    hideIndicator?: boolean;
    labelClass?: string;
    labelFormatter?: ((value: unknown, payload: TooltipPayload[]) => string | number | Snippet) | null;
    /** Draws each row yourself in place of the indicator, name and value. */
    formatter?: Snippet<[
        {
            value: unknown;
            name: string;
            item: TooltipPayload;
            index: number;
            payload: TooltipPayload[];
        }
    ]>;
    /** Overrides every row's indicator colour. */
    color?: string;
};
declare const ChartTooltip: import("svelte").Component<$$ComponentProps, {}, "ref">;
type ChartTooltip = ReturnType<typeof ChartTooltip>;
export default ChartTooltip;
