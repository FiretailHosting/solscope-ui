// Trade markers as SeriesChart draws them: grouped where they would cover
// each other, named for screen readers, and drawn as the trader's picture,
// initials or the buy and sell shape. Kept apart from the component so it
// can be tested without a browser.
/** How close two markers' centres may be, in pixels, before they group: the 24px target and room for its count. */
export const MARKER_CLUSTER_DISTANCE = 28;
/** The same on a touch screen, where markers are tapped with a finger. */
export const MARKER_CLUSTER_DISTANCE_COARSE = 36;
/**
 * clusterMarkers groups markers whose centres are closer than `distance`, so
 * none covers another. Markers are taken in time order; each joins the first
 * group whose spot, the spot of its first marker, is within the distance,
 * or starts its own. Every group is then at most `distance` across from its
 * spot, and the spots of two groups are at least `distance` apart. A grid of
 * `distance`-sized cells keeps it linear, so 500 markers stay cheap on every
 * resize.
 */
export function clusterMarkers(placed, distance = MARKER_CLUSTER_DISTANCE) {
    const ordered = [...placed].sort((a, b) => a.t - b.t || a.left - b.left);
    const clusters = [];
    const cells = new Map();
    const cellOf = (value) => Math.floor(value / distance);
    for (const marker of ordered) {
        const column = cellOf(marker.left);
        const row = cellOf(marker.top);
        let joined;
        search: for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (const index of cells.get(`${column + dx}|${row + dy}`) ?? []) {
                    const cluster = clusters[index];
                    if (Math.hypot(cluster.left - marker.left, cluster.top - marker.top) < distance) {
                        joined = cluster;
                        break search;
                    }
                }
            }
        }
        if (joined) {
            joined.members.push(marker);
            continue;
        }
        const key = `${column}|${row}`;
        cells.set(key, [...(cells.get(key) ?? []), clusters.length]);
        clusters.push({ left: marker.left, top: marker.top, members: [marker] });
    }
    return clusters;
}
/** clusterKey names a group by its trades, so a group keeps its button, and a pick, across resizes that keep it whole. */
export function clusterKey(members) {
    return members.map((member) => `${member.t}|${member.title}`).join('\n');
}
/** clusterSide is buy or sell when every trade in a group is one, and mixed otherwise. */
export function clusterSide(members) {
    const side = members[0]?.side ?? 'buy';
    return members.every((member) => member.side === side) ? side : 'mixed';
}
/** markerLabel names one trade for screen readers: the trade, when, and any note, as the readout shows them. */
export function markerLabel(marker, formatTime, withYear) {
    return [marker.title, formatTime(marker.t, withYear), marker.note?.text].filter(Boolean).join(', ');
}
/** The most trades a group's name lists one by one; beyond it, the name counts them. */
export const LISTED_TRADES = 3;
/**
 * clusterLabel names a group's button for screen readers and voice control.
 * One trade reads as markerLabel. A group starts with its visible "+N"
 * count, so voice control finds it by what it shows (WCAG 2.5.3); a few then
 * list each trade and when; more say how many, from when to when, or at
 * when if every time reads the same, and how many were buys and sells.
 */
export function clusterLabel(members, formatTime, withYear) {
    if (members.length === 1)
        return markerLabel(members[0], formatTime, withYear);
    const count = `+${members.length - 1} more, ${members.length} trades`;
    if (members.length <= LISTED_TRADES) {
        return `${count}: ${members.map((member) => `${member.title}, ${formatTime(member.t, withYear)}`).join('; ')}`;
    }
    const buys = members.filter((member) => member.side === 'buy').length;
    const sells = members.length - buys;
    const sides = [buys && `${buys} ${buys === 1 ? 'buy' : 'buys'}`, sells && `${sells} ${sells === 1 ? 'sell' : 'sells'}`].filter(Boolean).join(', ');
    const first = formatTime(members[0].t, withYear);
    const last = formatTime(members[members.length - 1].t, withYear);
    const when = first === last ? `at ${first}` : `from ${first} to ${last}`;
    return `${count} ${when}: ${sides}`;
}
/** initials are up to two letters from a name, the first of its first two words: "Maya Lopez" is "ML", "momentum-bot" is "MB". */
export function initials(name) {
    if (!name)
        return '';
    return name
        .trim()
        .split(/[\s_\-.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => Array.from(word)[0]?.toLocaleUpperCase() ?? '')
        .join('');
}
/**
 * markerFace picks what a marker shows: the picture once it has loaded, else
 * the initials of its name, else the buy or sell shape. While a picture
 * loads the fallback shows in the same circle, so nothing moves when it
 * lands, and a picture that fails keeps the fallback.
 */
export function markerFace(marker, status) {
    if (marker.avatar && status === 'loaded')
        return { kind: 'image', src: marker.avatar };
    const text = initials(marker.name);
    if (text)
        return { kind: 'initials', text };
    return { kind: 'shape' };
}
