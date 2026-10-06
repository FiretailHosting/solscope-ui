import type { ChartState } from 'layerchart';
import { type PlottedPoint } from '../../../chart/series.js';
type $$ComponentProps = {
    plotted: PlottedPoint[];
    candles: boolean;
    baseline: boolean;
    yDomain: [number, number];
    /** Space above and below the series, in pixels, so peaks and troughs are not cut off. */
    pad: number;
    /** Unique per chart, for the gradient and clip ids. */
    id: string;
    context?: ChartState<PlottedPoint>;
};
declare const SeriesPlot: import("svelte").Component<$$ComponentProps, {}, "context">;
type SeriesPlot = ReturnType<typeof SeriesPlot>;
export default SeriesPlot;
