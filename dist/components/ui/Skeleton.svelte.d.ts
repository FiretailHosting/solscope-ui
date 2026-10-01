type $$ComponentProps = {
    /** Any CSS width, such as '12rem' or '60%'. */
    width?: string;
    /** Any CSS height; the default matches the surrounding text. */
    height?: string;
    /** Any CSS border radius; use 'var(--radius-full)' for a circle. */
    radius?: string;
    class?: string;
};
declare const Skeleton: import("svelte").Component<$$ComponentProps, {}, "">;
type Skeleton = ReturnType<typeof Skeleton>;
export default Skeleton;
