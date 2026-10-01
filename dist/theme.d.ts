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
