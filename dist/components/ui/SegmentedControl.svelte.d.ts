export type SegmentedOption<OptionValue> = {
    value: OptionValue;
    label: string;
    disabled?: boolean;
};
import type { Snippet } from 'svelte';
declare function $$render<Value>(): {
    props: {
        label?: string;
        class?: string;
        /** Renders one button per option; without it, `children` are rendered as the buttons. */
        options?: SegmentedOption<Value>[];
        /** The selected option's value, for use with `options`. */
        value?: Value;
        onchange?: (value: Value) => void;
        children?: Snippet;
    };
    exports: {};
    bindings: "value";
    slots: {};
    events: {};
};
declare class __sveltets_Render<Value> {
    props(): ReturnType<typeof $$render<Value>>['props'];
    events(): ReturnType<typeof $$render<Value>>['events'];
    slots(): ReturnType<typeof $$render<Value>>['slots'];
    bindings(): "value";
    exports(): {};
}
interface $$IsomorphicComponent {
    new <Value>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<Value>['props']>>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<Value>['props']>, ReturnType<__sveltets_Render<Value>['events']>, ReturnType<__sveltets_Render<Value>['slots']>> & {
        $$bindings?: ReturnType<__sveltets_Render<Value>['bindings']>;
    } & ReturnType<__sveltets_Render<Value>['exports']>;
    <Value>(internal: unknown, props: ReturnType<__sveltets_Render<Value>['props']> & {}): ReturnType<__sveltets_Render<Value>['exports']>;
    z_$$bindings?: ReturnType<__sveltets_Render<any>['bindings']>;
}
declare const SegmentedControl: $$IsomorphicComponent;
type SegmentedControl<Value> = InstanceType<typeof SegmentedControl<Value>>;
export default SegmentedControl;
