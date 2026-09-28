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
    class?: string;
};
declare const Stat: import("svelte").Component<$$ComponentProps, {}, "">;
type Stat = ReturnType<typeof Stat>;
export default Stat;
