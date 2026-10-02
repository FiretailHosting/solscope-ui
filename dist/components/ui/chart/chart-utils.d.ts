import { type Component } from 'svelte';
import type { TooltipSeries } from 'layerchart';
/**
 * Where each theme's series colours apply. Dark covers both a saved Dark theme
 * and the system setting when the theme is Auto, the same way tokens.css does.
 */
export declare const chartThemeScopes: Record<'light' | 'dark', {
    media?: string;
    root: string;
}[]>;
export type ChartTheme = keyof typeof chartThemeScopes;
/**
 * Names, colours and icons for each series, keyed by the series key. Each
 * colour is set as `--color-<key>` on the chart, so marks can use
 * `var(--color-<key>)`.
 */
export type ChartConfig = {
    [key in string]: {
        label?: string;
        icon?: Component;
    } & ({
        color?: string;
        theme?: never;
    } | {
        color?: never;
        theme: Record<ChartTheme, string>;
    });
};
export type TooltipPayload = TooltipSeries;
/** Finds the config entry for a tooltip row, by its key, label or data. */
export declare function getPayloadConfigFromPayload(config: ChartConfig, payload: TooltipPayload, key: string, data?: Record<string, unknown> | null): ({
    label?: string;
    icon?: Component;
} & ({
    color?: string;
    theme?: never;
} | {
    color?: never;
    theme: Record<ChartTheme, string>;
})) | undefined;
type ChartContextValue = {
    config: ChartConfig;
};
export declare function setChartContext(value: ChartContextValue): ChartContextValue;
export declare function useChart(): ChartContextValue;
export {};
