export type Theme = 'system' | 'light' | 'dark';
/** The localStorage key that holds the chosen theme. */
export declare const themeStorageKey = "theme";
/** The order ThemeToggle cycles through. 'system' is never written to <html>. */
export declare const themes: readonly Theme[];
/**
 * Inline script that sets `data-theme` on <html> from the saved theme before
 * the page is drawn, so a saved Dark theme never flashes light first.
 * Put it in a <script> in the <head> of app.html. It does nothing when the
 * theme is Auto or storage is blocked.
 */
export declare const themeInitScript: string;
/**
 * The page background and the top bar colour per theme, from tokens.css:
 * what a browser paints before the stylesheet arrives and behind its own
 * chrome. A manifest's background_color and theme_color take the same.
 */
export declare const themeColors: {
    readonly light: {
        readonly bg: "#f3f4f6";
        readonly card: "#ffffff";
    };
    readonly dark: {
        readonly bg: "#12161c";
        readonly card: "#1a2029";
    };
};
/**
 * The theme-color metas: the top bar colour behind the browser chrome and,
 * from the Home Screen, the status bar, following the system theme until
 * `themeColorSyncScript` makes them follow the saved one.
 */
export declare const themeColorMetaTags: string;
/**
 * The launch screen: the page background before the stylesheet arrives,
 * following the system theme and the saved one, so a launch from the Home
 * Screen never flashes the other theme's colour.
 */
export declare const launchScreenStyle: string;
/**
 * Keeps the theme-color metas on the chosen theme: a forced Light or Dark
 * sets both to that colour, Auto leaves each to its own media query.
 */
export declare const themeColorSyncScript: string;
/**
 * Everything the <head> of app.html needs from the library, in order: the
 * theme-color metas, the launch screen, the saved theme applied before first
 * paint, and the metas kept in step with it. Put it before %sveltekit.head%;
 * a SvelteKit app injects it from a server hook so it never goes stale.
 */
export declare const appHead: string;
