// Traders' pictures for chart markers, each fetched and decoded once per page
// and shared by every chart, so markers redrawn on a live tick or a resize
// never fetch or decode again, and a picture that failed is not tried again.
const statuses = new Map();
const waiting = new Map();
/** avatarStatus is where a picture stands, or undefined when nothing has asked for it. */
export function avatarStatus(url) {
    return statuses.get(url);
}
/** settleAvatar records how a picture ended up and tells everything waiting on it. */
export function settleAvatar(url, status) {
    statuses.set(url, status);
    const callbacks = waiting.get(url);
    waiting.delete(url);
    callbacks?.forEach((callback) => callback());
}
/**
 * loadAvatar fetches and decodes a picture off the main thread, once, and
 * calls onSettled when it has loaded or failed; a picture already settled
 * returns at once without calling it. Without a browser it does nothing.
 */
export function loadAvatar(url, onSettled) {
    const status = statuses.get(url);
    if (status === 'loaded' || status === 'failed')
        return status;
    if (typeof Image === 'undefined')
        return 'pending';
    const callbacks = waiting.get(url) ?? new Set();
    callbacks.add(onSettled);
    waiting.set(url, callbacks);
    if (status === 'pending')
        return 'pending';
    statuses.set(url, 'pending');
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    image.decode().then(() => settleAvatar(url, 'loaded'), () => settleAvatar(url, 'failed'));
    return 'pending';
}
/** forgetAvatarWaiter stops calling back a chart that has gone, such as one unmounted while pictures load. */
export function forgetAvatarWaiter(onSettled) {
    for (const callbacks of waiting.values())
        callbacks.delete(onSettled);
}
