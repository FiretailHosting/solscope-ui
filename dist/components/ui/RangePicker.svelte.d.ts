import { type RangeOption } from '../../range-options.js';
declare function $$render<Value>(): {
    props: {
        options: RangeOption<Value>[];
        /** The selected option's value. */
        value?: Value;
        /** Names the button group and the select: "Chart range". */
        label: string;
        /** Below this screen width, in pixels, the select shows even where the buttons fit; 0 never. */
        collapseBelow?: number;
        onchange?: (value: Value) => void;
        class?: string;
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
declare const RangePicker: $$IsomorphicComponent;
type RangePicker<Value> = InstanceType<typeof RangePicker<Value>>;
export default RangePicker;
