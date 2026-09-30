type Mode = 'paper' | 'live';
type $$ComponentProps = {
    value?: Mode;
    liveEnabled?: boolean;
    onchange?: (mode: Mode) => void;
    /**
     * Called when Live is chosen while `liveEnabled` is false. With it, Live
     * stays clickable and should open a dialog explaining how to get real
     * money; without it, Live is disabled.
     */
    onliveunavailable?: () => void;
};
declare const ModeSwitch: import("svelte").Component<$$ComponentProps, {}, "value">;
type ModeSwitch = ReturnType<typeof ModeSwitch>;
export default ModeSwitch;
