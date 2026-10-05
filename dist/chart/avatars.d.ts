import type { AvatarStatus } from './markers.js';
/** avatarStatus is where a picture stands, or undefined when nothing has asked for it. */
export declare function avatarStatus(url: string): AvatarStatus | undefined;
/** settleAvatar records how a picture ended up and tells everything waiting on it. */
export declare function settleAvatar(url: string, status: 'loaded' | 'failed'): void;
/**
 * loadAvatar fetches and decodes a picture off the main thread, once, and
 * calls onSettled when it has loaded or failed; a picture already settled
 * returns at once without calling it. Without a browser it does nothing.
 */
export declare function loadAvatar(url: string, onSettled: () => void): AvatarStatus;
/** forgetAvatarWaiter stops calling back a chart that has gone, such as one unmounted while pictures load. */
export declare function forgetAvatarWaiter(onSettled: () => void): void;
