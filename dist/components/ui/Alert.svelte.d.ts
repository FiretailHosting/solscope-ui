import type { Snippet } from 'svelte';
import type { IconName } from '../../icons/icons.js';
type Variant = 'default' | 'error' | 'up' | 'warn';
type $$ComponentProps = {
    variant?: Variant;
    /**
     * Shows an icon before the text, so the variant does not rest on colour
     * alone. true picks one for the variant; an icon name picks that icon.
     */
    icon?: boolean | IconName;
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
