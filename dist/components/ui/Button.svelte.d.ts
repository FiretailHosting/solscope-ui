import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { IconName } from '../../icons/icons.js';
type Variant = 'default' | 'primary' | 'danger' | 'ghost' | 'link';
type Size = 'default' | 'sm' | 'lg';
interface Props extends HTMLButtonAttributes {
    variant?: Variant;
    size?: Size;
    /** Renders a link styled as a button. */
    href?: string;
    /** Icon before the label. */
    icon?: IconName;
    /**
     * Shows a spinner and blocks clicks while an action runs. The spinner
     * takes the icon's place, or covers the label when there is no icon,
     * so the button keeps its width.
     */
    loading?: boolean;
    children?: Snippet;
}
declare const Button: import("svelte").Component<Props, {}, "">;
type Button = ReturnType<typeof Button>;
export default Button;
