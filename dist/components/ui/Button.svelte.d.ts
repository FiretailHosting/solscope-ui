import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
type Variant = 'default' | 'primary' | 'danger' | 'ghost';
type Size = 'default' | 'sm' | 'lg';
interface Props extends HTMLButtonAttributes {
    variant?: Variant;
    size?: Size;
    children?: Snippet;
}
declare const Button: import("svelte").Component<Props, {}, "">;
type Button = ReturnType<typeof Button>;
export default Button;
