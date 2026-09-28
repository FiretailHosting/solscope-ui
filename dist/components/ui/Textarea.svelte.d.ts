import type { HTMLTextareaAttributes } from 'svelte/elements';
interface Props extends HTMLTextareaAttributes {
    class?: string;
}
declare const Textarea: import("svelte").Component<Props, {}, "">;
type Textarea = ReturnType<typeof Textarea>;
export default Textarea;
