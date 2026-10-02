import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';
interface Props extends HTMLAnchorAttributes {
    href: string;
    /**
     * Hidden when the page runs from the home screen on a phone, where the
     * app's top bar has a Back button of its own.
     */
    hideInStandalone?: boolean;
    /** Where the link goes, such as "Markets". */
    children?: Snippet;
}
declare const BackLink: import("svelte").Component<Props, {}, "">;
type BackLink = ReturnType<typeof BackLink>;
export default BackLink;
