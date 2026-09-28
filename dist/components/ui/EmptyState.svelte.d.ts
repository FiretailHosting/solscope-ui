import type { Snippet } from 'svelte';
import type { IconName } from '../../icons/icons.js';
type $$ComponentProps = {
    icon?: IconName;
    title: string;
    text?: string;
    class?: string;
    /** Actions, such as a button to create the first item. */
    children?: Snippet;
};
declare const EmptyState: import("svelte").Component<$$ComponentProps, {}, "">;
type EmptyState = ReturnType<typeof EmptyState>;
export default EmptyState;
