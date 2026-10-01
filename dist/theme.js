// One source of truth for the saved theme, shared by ThemeToggle and the
// script apps put in the <head> of app.html.
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
