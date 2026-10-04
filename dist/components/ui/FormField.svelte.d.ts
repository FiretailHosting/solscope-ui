import type { Snippet } from 'svelte';
type $$ComponentProps = {
    label?: string;
    hint?: string;
    /** Shown in place of the hint. Also set aria-invalid on the input. */
    error?: string;
    /** An id for the error, for the input's aria-describedby. */
    errorId?: string;
    /** An id for the hint, for the input's aria-describedby. */
    hintId?: string;
    class?: string;
    children?: Snippet;
};
declare const FormField: import("svelte").Component<$$ComponentProps, {}, "">;
type FormField = ReturnType<typeof FormField>;
export default FormField;
