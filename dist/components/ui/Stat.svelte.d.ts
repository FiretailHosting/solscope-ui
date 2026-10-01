import type { IconName } from '../../icons/icons.js';
type $$ComponentProps = {
    label: string;
    value: string;
    /** A second line, such as a change or a count. */
    hint?: string;
    /** Colours the hint: up for gains, down for losses. */
    tone?: 'default' | 'up' | 'down';
    icon?: IconName;
    /** Makes the whole tile a link. */
    href?: string;
    /**
     * Shows a placeholder in place of the value while it loads, at the
     * value's height so the tile does not move. The hint shows as given.
     */
    loading?: boolean;
    class?: string;
};
declare const Stat: import("svelte").Component<$$ComponentProps, {}, "">;
type Stat = ReturnType<typeof Stat>;
export default Stat;
