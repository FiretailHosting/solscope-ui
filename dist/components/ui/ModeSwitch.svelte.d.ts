type Mode = 'paper' | 'live';
type $$ComponentProps = {
    value?: Mode;
    liveEnabled?: boolean;
    onchange?: (mode: Mode) => void;
};
declare const ModeSwitch: import("svelte").Component<$$ComponentProps, {}, "value">;
type ModeSwitch = ReturnType<typeof ModeSwitch>;
export default ModeSwitch;
