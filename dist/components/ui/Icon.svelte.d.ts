import { type IconName } from '../../icons/icons.js';
type $$ComponentProps = {
    name: IconName;
    size?: number | string;
    /** Accessible name. Without one the icon is decorative and hidden. */
    label?: string;
    class?: string;
};
declare const Icon: import("svelte").Component<$$ComponentProps, {}, "">;
type Icon = ReturnType<typeof Icon>;
export default Icon;
