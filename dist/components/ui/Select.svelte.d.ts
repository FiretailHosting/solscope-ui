import type { Snippet } from 'svelte';
import type { HTMLSelectAttributes } from 'svelte/elements';
interface Props extends HTMLSelectAttributes {
    class?: string;
    children?: Snippet;
}
declare const Select: import("svelte").Component<Props, {}, "">;
type Select = ReturnType<typeof Select>;
export default Select;
