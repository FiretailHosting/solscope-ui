// One source of truth for the saved theme, shared by ThemeToggle and the
// snippets apps put in the <head> of app.html.
import { themeTokens } from './theme-tokens.js';
/** The localStorage key that holds the chosen theme. */
export const themeStorageKey = 'theme';
/** The order ThemeToggle cycles through. 'system' is never written to <html>. */
export const themes = ['system', 'light', 'dark'];
/**
 * Inline script that sets `data-theme` on <html> from the saved theme before
 * the page is drawn, so a saved Dark theme never flashes light first.
 * Put it in a <script> in the <head> of app.html. It does nothing when the
 * theme is Auto or storage is blocked.
 */
export const themeInitScript = `(function () { try { var theme = localStorage.getItem(${JSON.stringify(themeStorageKey)}); if (theme === "light" || theme === "dark") document.documentElement.setAttribute("data-theme", theme); } catch (error) {} })();`;
/**
 * The page background and the top bar colour per theme, from tokens.css:
 * what a browser paints before the stylesheet arrives and behind its own
 * chrome. A manifest's background_color and theme_color take the same.
 */
export const themeColors = {
    light: { bg: themeTokens.light.bg, card: themeTokens.light.card },
    dark: { bg: themeTokens.dark.bg, card: themeTokens.dark.card }
};
/**
 * The theme-color metas: the top bar colour behind the browser chrome and,
 * from the Home Screen, the status bar, following the system theme until
 * `themeColorSyncScript` makes them follow the saved one.
 */
export const themeColorMetaTags = `<meta name="theme-color" media="(prefers-color-scheme: light)" content="${themeColors.light.card}" /><meta name="theme-color" media="(prefers-color-scheme: dark)" content="${themeColors.dark.card}" />`;
/**
 * The launch screen: the page background before the stylesheet arrives,
 * following the system theme and the saved one, so a launch from the Home
 * Screen never flashes the other theme's colour.
 */
export const launchScreenStyle = `<style>html{background:${themeColors.light.bg}}@media (prefers-color-scheme: dark){html:not([data-theme="light"]){background:${themeColors.dark.bg}}}html[data-theme="dark"]{background:${themeColors.dark.bg}}</style>`;
/**
 * Keeps the theme-color metas on the chosen theme: a forced Light or Dark
 * sets both to that colour, Auto leaves each to its own media query.
 */
export const themeColorSyncScript = `<script>(function () { var colors = ${JSON.stringify({ light: themeColors.light.card, dark: themeColors.dark.card })}; var metas = document.querySelectorAll('meta[name="theme-color"]'); function sync() { var forced = document.documentElement.getAttribute("data-theme"); for (var i = 0; i < metas.length; i++) { var own = metas[i].media.indexOf("dark") === -1 ? "light" : "dark"; metas[i].setAttribute("content", colors[forced === "light" || forced === "dark" ? forced : own]); } } sync(); new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }); })();</script>`;
/**
 * Everything the <head> of app.html needs from the library, in order: the
 * theme-color metas, the launch screen, the saved theme applied before first
 * paint, and the metas kept in step with it. Put it before %sveltekit.head%;
 * a SvelteKit app injects it from a server hook so it never goes stale.
 */
export const appHead = [themeColorMetaTags, launchScreenStyle, `<script>${themeInitScript}</script>`, themeColorSyncScript].join('\n');
