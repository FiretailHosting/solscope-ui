import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';
interface Props extends HTMLAnchorAttributes {
    href: string;
    /**
     * Hidden when the page runs from the home screen on a phone, where the
     * app's top bar has a Back button of its own.
     */
    hideInStandalone?: boolean;
    /**
     * muted is the small grey link; link keeps the browser's default link
     * look, underlined in the text colour and size, as a page's own back
     * link had on desktop.
     */
    variant?: 'muted' | 'link';
    /** Where the link goes, such as "Markets". */
    children?: Snippet;
}
declare const BackLink: import("svelte").Component<Props, {}, "">;
type BackLink = ReturnType<typeof BackLink>;
export default BackLink;
