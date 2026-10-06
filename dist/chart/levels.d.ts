/**
 * A value marked across a chart. key keeps the line in place as it updates;
 * label says what it is, "Take profit", so tone, the line's colour, is never
 * the only signal. A dashed line reads as pending, such as an order not yet
 * filled.
 */
export type SeriesLevel = {
    key: string;
    value: number;
    label: string;
    tone?: 'up' | 'down' | 'neutral';
    dashed?: boolean;
};
/** Where a level sits: on the plot at its value, or pinned to the top or bottom edge because it is too far off to fit. */
export type LevelPin = 'above' | 'below' | null;
/** A level as drawn: its pin, when it is too far off to fit. */
export type PlacedLevel = SeriesLevel & {
    pinned: LevelPin;
};
/**
 * How far outside a series' range a level may be and still widen the view to
 * fit, as a share of the range. Wider than a trade's: a level is a price the
 * trader chose, so seeing it on the scale is worth a little more room, and
 * the series still keeps over 80% of the plot with a level each side.
 */
export declare const LEVEL_PRICE_TOLERANCE = 0.1;
/**
 * levelsInRange keeps the levels close enough to the range bounds spans to
 * widen it: within `tolerance` of the span below its low or above its high.
 * The rest are pinned to an edge instead, so a far level never flattens the
 * series.
 */
export declare function levelsInRange<Level extends Pick<SeriesLevel, 'value'>>(levels: Level[], bounds: {
    min: number;
    span: number;
} | null, tolerance?: number): Level[];
/**
 * boundsWithLevels widens bounds to take in the levels' values, so a level
 * just outside the plotted prices sits at its true value inside the plot.
 * Pass only levelsInRange, or one far level would flatten the series.
 */
export declare function boundsWithLevels(bounds: {
    min: number;
    span: number;
}, levels: Pick<SeriesLevel, 'value'>[]): {
    min: number;
    span: number;
};
/** levelPin says a value is above or below the bounds the plot shows, or null when it is on the plot. */
export declare function levelPin(value: number, bounds: {
    min: number;
    span: number;
}): LevelPin;
/**
 * placeLevels pins each level outside the bounds the plot shows to the edge
 * it is beyond, keeps the rest at their value, and leaves out levels with no
 * finite value and repeats of a key, which would draw twice.
 */
export declare function placeLevels(levels: SeriesLevel[], bounds: {
    min: number;
    span: number;
}): PlacedLevel[];
/** levelText names a level for screen readers: "Take profit at $0.0123", and "above the chart" when it is pinned. */
export declare function levelText(level: Pick<PlacedLevel, 'label' | 'value'> & {
    pinned?: LevelPin;
}, format: (n: number) => string): string;
/** levelsSummary is the levels as sentences, for the chart's description: "Take profit at $0.0123. Stop loss at $0.0100.", or '' with none. */
export declare function levelsSummary(levels: (Pick<PlacedLevel, 'label' | 'value'> & {
    pinned?: LevelPin;
})[], format: (n: number) => string): string;
/**
 * stackLabels moves labels apart so none covers another: given where each
 * label would sit, its centre's y in pixels, and how tall a label is, it
 * keeps their order and pushes each clear of the one above, and keeps them
 * all between `top` and `bottom`, pushing up from the bottom when they run
 * past it. The result is in the order given.
 */
export declare function stackLabels(wanted: number[], height: number, top: number, bottom: number): number[];
