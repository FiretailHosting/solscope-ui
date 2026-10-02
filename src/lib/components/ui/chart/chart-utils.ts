// Adapted from shadcn-svelte's chart (MIT, see LICENSE.txt in this folder),
// commit 3ef557c, with its Tailwind classes replaced by solscope-ui tokens.

import { getContext, setContext, type Component } from 'svelte';
import type { TooltipSeries } from 'layerchart';

/**
 * Where each theme's series colours apply. Dark covers both a saved Dark theme
 * and the system setting when the theme is Auto, the same way tokens.css does.
 */
export const chartThemeScopes: Record<'light' | 'dark', { media?: string; root: string }[]> = {
	light: [{ root: '' }],
	dark: [
		{ media: '(prefers-color-scheme: dark)', root: ":root:not([data-theme='light'])" },
		{ root: ":root[data-theme='dark']" }
	]
};

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
	} & (
		| { color?: string; theme?: never }
		| { color?: never; theme: Record<ChartTheme, string> }
	);
};

export type TooltipPayload = TooltipSeries;

/** Finds the config entry for a tooltip row, by its key, label or data. */
export function getPayloadConfigFromPayload(
	config: ChartConfig,
	payload: TooltipPayload,
	key: string,
	data?: Record<string, unknown> | null
) {
	if (typeof payload !== 'object' || payload === null) return undefined;

	const payloadConfig =
		'config' in payload && typeof payload.config === 'object' && payload.config !== null
			? payload.config
			: undefined;

	let configLabelKey: string = key;

	if (payload.key === key) {
		configLabelKey = payload.key;
	} else if (payload.label === key) {
		configLabelKey = payload.label;
	} else if (key in payload && typeof payload[key as keyof typeof payload] === 'string') {
		configLabelKey = payload[key as keyof typeof payload] as string;
	} else if (
		payloadConfig !== undefined &&
		key in payloadConfig &&
		typeof payloadConfig[key as keyof typeof payloadConfig] === 'string'
	) {
		configLabelKey = payloadConfig[key as keyof typeof payloadConfig] as string;
	} else if (data != null && key in data && typeof data[key] === 'string') {
		configLabelKey = data[key] as string;
	}

	return configLabelKey in config ? config[configLabelKey] : config[key];
}

type ChartContextValue = {
	config: ChartConfig;
};

const chartContextKey = Symbol('chart-context');

export function setChartContext(value: ChartContextValue) {
	return setContext(chartContextKey, value);
}

export function useChart() {
	return getContext<ChartContextValue>(chartContextKey);
}
