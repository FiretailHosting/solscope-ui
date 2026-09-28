import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends HTMLInputAttributes {
    class?: string;
}
declare const Input: import("svelte").Component<Props, {}, "">;
type Input = ReturnType<typeof Input>;
export default Input;
