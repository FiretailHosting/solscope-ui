import { type SeriesMarker, type SeriesPoint } from '../../../chart/series.js';
type $$ComponentProps = {
    points: SeriesPoint[];
    /** Candles need every point to carry o, h and l; otherwise a line is drawn. */
    kind?: 'line' | 'candles';
    height?: number;
    markers?: SeriesMarker[];
    label?: string;
    /** What a point is, for the default hint: "price", "market cap". */
    noun?: string;
    /** Text under the chart while nothing is inspected; by default, how to inspect. */
    hint?: string;
    /** Shown in place of the chart when there are fewer than two points. */
    empty?: string;
    /** Place points by their time rather than evenly, so gaps show. */
    byTime?: boolean;
    /** With byTime, break the line where points are further apart than this, in ms. */
    gap?: number;
    /** Keep height in pixels at any width, rather than scaling with it. */
    fixed?: boolean;
    /** Draw a zero line, keep it in view and fill toward it: above it reads as gain, below as loss. */
    baseline?: boolean;
    /** Faint horizontal lines at round values, labelled at the right edge. */
    guides?: boolean;
    /** Times along the bottom edge. */
    timeAxis?: boolean;
    /** The last point is now: its dot pulses. */
    live?: boolean;
    /** Draw the line in and fade the fill when the data changes; off under reduced motion anyway. */
    animate?: boolean;
    /** How a value reads when inspected. */
    format?: (n: number) => string;
    /** How a moment reads: "Sep 25, 5:21 AM". */
    formatTime?: (t: number, withYear: boolean) => string;
    /** How a day reads: "Sep 24". */
    formatDay?: (t: number, withYear: boolean) => string;
    /** With this, an inspected point also shows its change from the first point, as this formats it. */
    change?: (difference: number) => string;
    class?: string;
};
declare const SeriesChart: import("svelte").Component<$$ComponentProps, {}, "">;
type SeriesChart = ReturnType<typeof SeriesChart>;
export default SeriesChart;
