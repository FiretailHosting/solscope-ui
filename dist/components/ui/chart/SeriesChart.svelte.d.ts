import { type Component } from 'svelte';
import { type SeriesLevel } from '../../../chart/levels.js';
import { type SeriesMarker, type SeriesPoint } from '../../../chart/series.js';
type $$ComponentProps = {
    points: SeriesPoint[];
    /** Candles need every point to carry o, h and l; otherwise a line is drawn. */
    kind?: 'line' | 'candles';
    height?: number;
    /** Trades on the chart; each may carry the trader's `avatar` picture and `name`. */
    markers?: SeriesMarker[];
    /** Prices marked across the plot, such as an open order or a take profit, each with its label and value at the right edge; updated in place by key. */
    levels?: SeriesLevel[];
    label?: string;
    /** What a point is, for the default hint: "price", "market cap". */
    noun?: string;
    /** Text under the chart while nothing is inspected; by default, how to inspect. */
    hint?: string;
    /** Shown in place of the chart when there are fewer than two points. */
    empty?: string;
    /** The chart's description for screen readers; by default its span, start, end, high and low. The levels are read after it. */
    summary?: string;
    /** Place points by their time rather than evenly, so gaps show. */
    byTime?: boolean;
    /** With byTime, break the line where points are further apart than this, in ms. */
    gap?: number;
    /** Keep height in pixels at any width, rather than scaling with it. */
    fixed?: boolean;
    /** Draw a zero line, keep it in view and fill toward it: above it reads as gain, below as loss. */
    baseline?: boolean;
    /** Faint horizontal lines at round values, labelled at the left edge. */
    guides?: boolean;
    /** Times along the bottom edge. */
    timeAxis?: boolean;
    /** The last point is now: its dot pulses. */
    live?: boolean;
    /** Reveal the chart from left to right when a new series arrives; off under reduced motion anyway. */
    animate?: boolean;
    /** How a value reads when inspected. */
    format?: (n: number) => string;
    /** How a value reads on the plot's own labels: the guides, zero and the inspected level. `format` by default, so a shorter one keeps them apart on a phone. */
    axisFormat?: (n: number) => string;
    /** How a moment reads: "Sep 25, 5:21 AM". */
    formatTime?: (t: number, withYear: boolean) => string;
    /** How a day reads: "Sep 24". */
    formatDay?: (t: number, withYear: boolean) => string;
    /** With this, an inspected point also shows its change from the first point, as this formats it. */
    change?: (difference: number) => string;
    class?: string;
};
declare const SeriesChart: Component<$$ComponentProps, {}, "">;
type SeriesChart = ReturnType<typeof SeriesChart>;
export default SeriesChart;
