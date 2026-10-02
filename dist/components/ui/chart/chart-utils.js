// Adapted from shadcn-svelte's chart (MIT, see LICENSE.txt in this folder),
// commit 3ef557c, with its Tailwind classes replaced by solscope-ui tokens.
import { getContext, setContext } from 'svelte';
/**
 * Where each theme's series colours apply. Dark covers both a saved Dark theme
 * and the system setting when the theme is Auto, the same way tokens.css does.
 */
export const chartThemeScopes = {
    light: [{ root: '' }],
    dark: [
        { media: '(prefers-color-scheme: dark)', root: ":root:not([data-theme='light'])" },
        { root: ":root[data-theme='dark']" }
    ]
};
/** Finds the config entry for a tooltip row, by its key, label or data. */
export function getPayloadConfigFromPayload(config, payload, key, data) {
    if (typeof payload !== 'object' || payload === null)
        return undefined;
    const payloadConfig = 'config' in payload && typeof payload.config === 'object' && payload.config !== null
        ? payload.config
        : undefined;
    let configLabelKey = key;
    if (payload.key === key) {
        configLabelKey = payload.key;
    }
    else if (payload.label === key) {
        configLabelKey = payload.label;
    }
    else if (key in payload && typeof payload[key] === 'string') {
        configLabelKey = payload[key];
    }
    else if (payloadConfig !== undefined &&
        key in payloadConfig &&
        typeof payloadConfig[key] === 'string') {
        configLabelKey = payloadConfig[key];
    }
    else if (data != null && key in data && typeof data[key] === 'string') {
        configLabelKey = data[key];
    }
    return configLabelKey in config ? config[configLabelKey] : config[key];
}
const chartContextKey = Symbol('chart-context');
export function setChartContext(value) {
    return setContext(chartContextKey, value);
}
export function useChart() {
    return getContext(chartContextKey);
}
