import type { SeriesMarker } from './series.js';
/** A marker placed on the plot, in pixels from its top left corner. */
export type PlacedMarker = SeriesMarker & {
    left: number;
    top: number;
};
/** Markers drawn as one button: the first one's spot, and every trade in it, in time order. */
export type MarkerCluster<Marker extends PlacedMarker = PlacedMarker> = {
    left: number;
    top: number;
    members: Marker[];
};
/** How close two markers' centres may be, in pixels, before they group: the 24px target and room for its count. */
export declare const MARKER_CLUSTER_DISTANCE = 28;
/** The same on a touch screen, where markers are tapped with a finger. */
export declare const MARKER_CLUSTER_DISTANCE_COARSE = 36;
/**
 * clusterMarkers groups markers whose centres are closer than `distance`, so
 * none covers another. Markers are taken in time order; each joins the first
 * group whose spot, the spot of its first marker, is within the distance,
 * or starts its own. Every group is then at most `distance` across from its
 * spot, and the spots of two groups are at least `distance` apart. A grid of
 * `distance`-sized cells keeps it linear, so 500 markers stay cheap on every
 * resize.
 */
export declare function clusterMarkers<Marker extends PlacedMarker>(placed: Marker[], distance?: number): MarkerCluster<Marker>[];
/** clusterKey names a group by its trades, so a group keeps its button, and a pick, across resizes that keep it whole. */
export declare function clusterKey(members: SeriesMarker[]): string;
/** clusterSide is buy or sell when every trade in a group is one, and mixed otherwise. */
export declare function clusterSide(members: SeriesMarker[]): 'buy' | 'sell' | 'mixed';
/** markerLabel names one trade for screen readers: the trade, when, and any note, as the readout shows them. */
export declare function markerLabel(marker: SeriesMarker, formatTime: (t: number, withYear: boolean) => string, withYear: boolean): string;
/** The most trades a group's name lists one by one; beyond it, the name counts them. */
export declare const LISTED_TRADES = 3;
/**
 * clusterLabel names a group's button for screen readers and voice control.
 * One trade reads as markerLabel. A group starts with its visible "+N"
 * count, so voice control finds it by what it shows (WCAG 2.5.3); a few then
 * list each trade and when; more say how many, from when to when, or at
 * when if every time reads the same, and how many were buys and sells.
 */
export declare function clusterLabel(members: SeriesMarker[], formatTime: (t: number, withYear: boolean) => string, withYear: boolean): string;
/** initials are up to two letters from a name, the first of its first two words: "Maya Lopez" is "ML", "momentum-bot" is "MB". */
export declare function initials(name: string | undefined): string;
/** Where a trader's picture stands: still loading, decoded and ready, or failed. */
export type AvatarStatus = 'pending' | 'loaded' | 'failed';
/** What a marker shows: the trader's picture, their initials, or the buy or sell shape. */
export type MarkerFace = {
    kind: 'image';
    src: string;
} | {
    kind: 'initials';
    text: string;
} | {
    kind: 'shape';
};
/**
 * markerFace picks what a marker shows: the picture once it has loaded, else
 * the initials of its name, else the buy or sell shape. While a picture
 * loads the fallback shows in the same circle, so nothing moves when it
 * lands, and a picture that fails keeps the fallback.
 */
export declare function markerFace(marker: Pick<SeriesMarker, 'avatar' | 'name'>, status: AvatarStatus | undefined): MarkerFace;
