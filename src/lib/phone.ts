// The one phone query, shared by the library and the app: a narrow screen
// with a touch pointer. A narrow desktop window with a mouse keeps the
// desktop layout. TabBar shows, Dialog becomes a bottom sheet and the page
// scroll is pinned under it; the Sidebar drawer keeps its own width-only
// breakpoint, so a narrow desktop window still gets the drawer. CSS cannot
// read this constant, so the components' media queries repeat the text.
export const PHONE_QUERY = '(max-width: 860px) and (pointer: coarse)';
