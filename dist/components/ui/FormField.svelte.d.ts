import type { Snippet } from 'svelte';
type $$ComponentProps = {
    label?: string;
    hint?: string;
    /** Shown in place of the hint. Also set aria-invalid on the input. */
    error?: string;
    class?: string;
    children?: Snippet;
};
declare const FormField: import("svelte").Component<$$ComponentProps, {}, "">;
type FormField = ReturnType<typeof FormField>;
export default FormField;
