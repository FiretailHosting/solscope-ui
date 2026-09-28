import type { Snippet } from 'svelte';
import type { IconName } from '../../icons/icons.js';
type $$ComponentProps = {
    /** Header title. With no title and no actions there is no header. */
    title?: string;
    icon?: IconName;
    /** Drop the body padding, for tables and lists that run edge to edge. */
    flush?: boolean;
    class?: string;
    actions?: Snippet;
    children?: Snippet;
};
declare const Card: import("svelte").Component<$$ComponentProps, {}, "">;
type Card = ReturnType<typeof Card>;
export default Card;
