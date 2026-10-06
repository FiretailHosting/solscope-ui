import type { Snippet } from 'svelte';
type $$ComponentProps = {
    /** What a point is, as the chart's `noun`. */
    noun?: string;
    /** The chart's own `hint`, if it has one: held instead of the default. */
    hint?: string;
    /** Hold the hint with markers, as the chart's `markersPossible`. */
    markersPossible?: boolean;
    /** Hide the whole row from screen readers, as a stand-in; SeriesChart passes false. */
    standIn?: boolean;
    /** What shows in the row, over the held hint. */
    children?: Snippet;
};
declare const SeriesHintRow: import("svelte").Component<$$ComponentProps, {}, "">;
type SeriesHintRow = ReturnType<typeof SeriesHintRow>;
export default SeriesHintRow;
