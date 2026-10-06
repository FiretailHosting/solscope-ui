# solscope-ui

UI component library for [solscope](https://github.com/FiretailHosting/solscope).
Built on Svelte 5 with a flat, corporate design: neutral greys, one navy accent, no gradients or shadows.
Dark and light mode, CSS variable theming, and a technical icon set drawn for the library.
Charts are the one part with a dependency: [LayerChart](https://layerchart.com) draws them, `SeriesChart` included.

## Install

The built `dist/` is committed, so the package installs straight from a tag with no registry or token:

```
"@firetailhosting/solscope-ui": "github:FiretailHosting/solscope-ui#v0.19.0"
```

## Usage

Import the CSS tokens once at your app root:

```svelte
<!-- +layout.svelte -->
<script>
  import '@firetailhosting/solscope-ui/tokens.css';
  import '@firetailhosting/solscope-ui/globals.css';
</script>
```

Then use components:

```svelte
<script>
  import { Button, Card, PageHead, Sidebar, SidebarNavItem } from '@firetailhosting/solscope-ui';
</script>

<Card>
  <PageHead title="Portfolio" />
  <Button variant="primary">Trade</Button>
</Card>
```

## Components

| Component | Description |
|-----------|-------------|
| `Alert` | Notice, warning, error and success messages; errors are announced at once, others politely; `icon` adds one so the variant does not rest on colour alone |
| `AppShell` | Full-page layout wrapper with sidebar slot |
| `BackLink` | Link back to the parent page with an arrow, muted or a plain underlined `link`; a 44px tap target on phones, `hideInStandalone` hides it under the app's own Back button; see [Back link](#back-link) |
| `Badge` | Inline status badge (default, up, down, accent) |
| `Balance` | A balance above an amount field: `label`, the value as children with an optional `title`, `busy` while it loads and an `action` snippet at the end, such as a link Button for Max |
| `Button` | Button or link (`href`), variants default, primary, danger, ghost and link, which is text alone in the accent colour for Max or Try again inside a line; optional `icon`; `loading` shows a spinner, ignores presses (no second submit) and keeps the width, staying enabled with `aria-disabled` and `aria-busy` so it keeps focus, while `disabled` stays native; `aria-disabled="true"` dims it but keeps it focusable and tappable, so a press can say why; a dimmed primary loses its fill for a dashed outline, so the state does not rest on colour alone |
| `Card` | Container with an optional header: `title`, `icon`, `actions`; `flush` for edge-to-edge tables |
| `ChartContainer` | Wraps a LayerChart chart: themes it from the tokens and sets `--color-<key>` for each series in `config` |
| `ChartHint` | What a chart says while nothing is inspected: hover wording for a mouse, drag wording on a touch screen |
| `SeriesChart` | A price or value over time as a line over a gradient fill or as candles, drawn by LayerChart, with guides, a time axis, a crosshair, price levels, trade markers with traders' pictures and the same inspection by pointer, finger, keyboard and screen reader; see [Series chart](#series-chart) |
| `ChartTooltip` | Tooltip for a chart inside `ChartContainer`, with `indicator` dot, line or dashed; no glide or fade under reduced motion; `aria-hidden` goes on its outermost element |
| `Dialog` | Modal over a native `<dialog>`: `title` or `label`, close button, Escape, backdrop tap, swipe down on phones, focus return; a centred card on desktop and a bottom sheet on phones; see [Dialog](#dialog) |
| `EmptyState` | Icon, title, text and actions for a list with nothing in it |
| `FormField` | Label wrapping an input, with a `hint` or an `error` under it, outside the label so they are not read as the field's name; `hintId` and `errorId` name them for the input's `aria-describedby`; the error is not announced on its own |
| `Grid` | Up to `cols` columns of at least `minWidth`, fewer when they would be narrower |
| `Icon` | One of the library's icons by `name`; decorative unless given a `label` |
| `InlineConfirm` | A question asked in place before an action that cannot be undone, with confirm and cancel buttons; see [Inline confirm](#inline-confirm) |
| `Input` | Styled text input |
| `Label` | Form label |
| `ModeSwitch` | Paper/Live trading mode toggle; `onliveunavailable` keeps Live clickable when `liveEnabled` is false |
| `PageHead` | Page title with optional actions row |
| `PageSearch` | A sheet with one field and the app's pages with their icons, filtered as you type; Return or a tap goes to the page and closes it; `sections` adds result sections the app searches, such as coins; see [Page search](#page-search) |
| `Pagination` | Previous and Next buttons, "Page 2 of 14" and the row range for a long table; see [Pagination](#pagination) |
| `Pill` | Status pill (default, live, ok) |
| `RangePicker` | A chart's range as segmented buttons, or a labelled native select below `collapseBelow` pixels of screen width; see [Range picker](#range-picker) |
| `RowList` | A list of `RowItem`s for a phone, where a table would scroll sideways; `label` names it, `busy` says rows are loading; see [Row list](#row-list) |
| `RowItem` | One row: a name with a `detail` under it, a `value` with a `note` under it, `href` makes the row a link and `actions` sit outside it |
| `Select` | Styled select dropdown |
| `SegmentedControl` | Tab-style button group: `options` with `bind:value` and `onchange`, or your own `<button>` children with `class:active` |
| `Separator` | Horizontal or vertical rule |
| `Sidebar` | Navigation sidebar; always shown on wide screens, `open` slides it in as a drawer on narrow ones, with a close button, the page inert behind it, a page scroll lock and safe-area insets; `id` for the menu button's `aria-controls` |
| `SidebarNavItem` | Sidebar link with `icon`, active state and badge |
| `SidebarSection` | Titled group of sidebar links |
| `Skeleton` | Pulsing grey placeholder for loading content: `width`, `height`, `radius`; hidden from screen readers |
| `Stat` | Stat tile with label, value, `hint` (toned up or down), `icon`, optional `href`; `loading` shows a placeholder value |
| `TabBar` | Phone bottom bar with the main destinations, the page shown marked by a bar at the top edge and `aria-current`, and a More item that opens the drawer; labels wrap to two lines; `variant="pill"` floats it as a rounded group with a round search button beside it; shown only on phones; see [Tab bar](#tab-bar) |
| `Table` | Styled data table with overflow scroll; `rowHover={false}` turns off the row highlight for rows that are not clickable |
| `Textarea` | Styled textarea |
| `ThemeToggle` | Cycles through auto, light and dark themes and saves the choice; see [Saved theme](#saved-theme) |
| `Toast` | A one-line notice fixed over the page with an action and a dismiss button, announced once, never taking focus and giving it back on dismiss; mounted toasts stack and publish `--toast-stack-height`; see [Toast](#toast) |

## Icons

`Icon` draws from `icons`, a map of 24px line icons with chamfered corners and small node dots.
`bun run dev` opens a gallery of every icon and component.
Add an icon by adding its paths to `src/lib/icons/icons.ts`.

## Theming

Colors, spacing, type sizes, radii and fonts are CSS variables in `tokens.css`, and every component is drawn from them, so changing the tokens restyles an app that uses only library components and tokens.
Text uses IBM Plex Sans 1.1 (weights 400 to 700), self-hosted from `fonts/` under the SIL Open Font License, with the system font stack as a fallback.
The sidebar is dark slate in both themes, with its own `--sidebar-*` tokens.
Override any token in your app's CSS to customize.
Component classes are prefixed `sui-` so they cannot collide with an app's own class names.

Token names and component props are the library's public contract: renaming or removing one is a major version.

### Spacing and type

Spacing is a 4px scale from `--space-unit` (0.25rem): `--space-1` to `--space-12` in the steps 1, 2, 3, 4, 5, 6, 7, 8, 10 and 12, with the half steps `--space-0-5`, `--space-1-5`, `--space-2-5` and `--space-3-5`.
Each step is a multiple of the unit, so changing the unit alone makes the whole library tighter or looser; any step can also be set on its own.
Use them for every padding, margin and gap in an app, so a restyle reaches the app's own layout too.

Type sizes run `--text-2xs`, `--text-xs`, `--text-sm`, `--text-md`, `--text-lg`, `--text-xl`, `--text-2xl` and `--text-3xl`.
`--text-md` is the body size; 2xs and xs are for small uppercase labels and hints, sm for controls and secondary text, lg and up for headings and figures.

### Globals

`globals.css` styles bare `input`, `select` and `textarea` elements like the library's own, so an app's unclassed controls match, and gives them 16px text and 44px height on touch screens.
The look sits inside `:where()`, so any rule of an app outranks it, such as an invalid field's border.
It also provides helper classes for an app's markup: `sui-sr-only`, `sui-muted`, `sui-small`, `sui-error`, `sui-up`, `sui-down`, `sui-mono`, `sui-stack` (one gap between stacked blocks), `sui-skeleton-line` (a line of placeholder text) and `sui-page-loading` (rows kept from the last page while the next loads).
A bare `button` or `a` with `aria-disabled="true"` is dimmed the way a Button is.
The page's `scroll-padding-bottom` clears the mounted toasts and, on phones, the tab bar.

### Tokens in code

`themeTokens` holds every token of `tokens.css` as a string, per theme (`themeTokens.dark.bg`), generated from the stylesheet by `bun run tokens` and checked by `bun run check`.
`themeColors` picks the page background and the top bar colour per theme, for a manifest's `background_color` and `theme_color` or an offline page.

### Saved theme and app head

`ThemeToggle` saves the chosen theme in `localStorage`, but it only runs once the app's JavaScript starts.
`appHead` is everything the `<head>` of `app.html` needs from the library: the theme-color metas, a launch screen in the page background so a Home Screen launch never flashes the other theme, `themeInitScript`, which applies the saved theme before first paint, and a script that keeps the metas on the chosen theme.
Inject it before `%sveltekit.head%` from a server hook, so it never goes stale when the tokens change:

```ts
// src/hooks.server.ts
import { appHead } from '@firetailhosting/solscope-ui';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = ({ event, resolve }) =>
  resolve(event, { transformPageChunk: ({ html }) => html.replace('%app.head%', appHead) });
```

The pieces are also exported on their own: `themeColorMetaTags`, `launchScreenStyle`, `themeInitScript` and `themeColorSyncScript`.
The saved theme script does nothing when the theme is Auto or storage is blocked.

### Phone query

`PHONE_QUERY` is `(max-width: 860px) and (pointer: coarse)`: a narrow screen with a touch pointer.
TabBar shows, Dialog becomes a sheet, BackLink grows to 44px and the page scroll is pinned under it.
A narrow desktop window with a mouse keeps the desktop layout, apart from the Sidebar drawer, which still opens under 860px.
Use the same query for the app's own phone layouts, in CSS as written and in code through `matchMedia`:

```ts
import { PHONE_QUERY } from '@firetailhosting/solscope-ui';
const phone = window.matchMedia(PHONE_QUERY);
```

### Sidebar layout

```svelte
<!-- +layout.svelte -->
<script>
  import { AppShell, Sidebar, SidebarNavItem } from '@firetailhosting/solscope-ui';
  import { page } from '$app/state';

  let menuOpen = $state(false);

  const links = [
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/orders', label: 'Orders' },
    { href: '/bots', label: 'Bots' },
  ];
</script>

<AppShell>
  {#snippet sidebar()}
    <Sidebar bind:open={menuOpen} id="app-navigation">
      {#snippet header()}
        <a href="/" style="font-weight: 650;">solscope</a>
      {/snippet}
      {#each links as link}
        <SidebarNavItem href={link.href} icon="orders" active={page.url.pathname.startsWith(link.href)}>
          {link.label}
        </SidebarNavItem>
      {/each}
    </Sidebar>
  {/snippet}
  <main>{@render children()}</main>
</AppShell>
```

While the drawer is open everything outside it is `inert`, so render a Dialog it opens inside the Sidebar, or close the drawer first.

### Segmented control

```svelte
<script lang="ts">
  import { SegmentedControl, type SegmentedOption } from '@firetailhosting/solscope-ui';

  type Range = '1d' | '1w' | 'all';
  const ranges: SegmentedOption<Range>[] = [
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: 'all', label: 'All', disabled: true },
  ];
  let range = $state<Range>('1w');
</script>

<SegmentedControl label="Chart range" options={ranges} bind:value={range} />

<!-- Or write the buttons yourself -->
<SegmentedControl label="Side">
  <button class:active={side === 'buy'} aria-pressed={side === 'buy'} onclick={() => (side = 'buy')}>Buy</button>
  <button class:active={side === 'sell'} aria-pressed={side === 'sell'} onclick={() => (side = 'sell')}>Sell</button>
</SegmentedControl>
```

### Dialog

```svelte
<script lang="ts">
  import { Button, Dialog } from '@firetailhosting/solscope-ui';
  let help = $state(false);
</script>

{#if help}
  <Dialog title="Real money is off" onclose={() => (help = false)}>
    <p>Ask an admin to turn it on for your account.</p>
    {#snippet footer()}
      <Button onclick={() => (help = false)}>Close</Button>
    {/snippet}
  </Dialog>
{/if}
```

It opens as a modal when mounted, so render it inside an `{#if}` and drop it in `onclose`, or `bind:open` to keep it mounted.
`title` is text or a snippet and names the dialog; without one, give it a `label`, which the types require.
`size` is `default` (26rem) or `lg` (42rem); `closeLabel` names the close button and `closeOnBackdrop={false}` keeps a backdrop tap from closing it.
Other attributes, such as `aria-describedby`, go on the `<dialog>`.
Under the [phone query](#phone-query) it docks at the bottom as a sheet with a sticky heading, clear of the status bar and padded for the home indicator; elsewhere it is a centred card.
Escape, the close button, a backdrop tap and `open = false` all close it; focus goes back to the control that opened it.
As a sheet it also closes on a swipe down that starts in its content while nothing under the finger is scrolled down, so scrolling back up and dragging a field never close it; reduced motion skips its slide.
`onclose` is called exactly once per close, however it closed, also when the dialog unmounts while open.

### Tab bar

```svelte
<script lang="ts">
  import { TabBar, type TabBarItem } from '@firetailhosting/solscope-ui';
  const tabs: TabBarItem[] = [
    { href: '/', label: 'Dashboard', icon: 'dashboard', active: page.url.pathname === '/' },
    { href: '/markets', label: 'Markets', icon: 'markets', active: section('/markets') },
    { href: '/portfolio', label: 'Portfolio', icon: 'portfolio', active: section('/portfolio') },
    { href: '/bots', label: 'Bots', icon: 'bots', badge: 2, active: section('/bots') },
  ];
  // The exact page, or a page inside the section, such as one market.
  function section(path: string): TabBarItem['active'] {
    if (page.url.pathname === path) return 'page';
    return page.url.pathname.startsWith(path + '/') ? 'section' : false;
  }
</script>

<TabBar items={tabs} moreBadge={session.unread} moreOpen={menuOpen} onmore={() => (menuOpen = true)} />
```

Each item has `href`, a one-word `label`, an `icon`, `active` for the page shown and an optional `badge` count, read out as unread.
`active: true` or `'page'` means the item is the exact page shown, set as `aria-current="page"`; `'section'` means the page lives inside the item's section, set as `aria-current="true"`.
Either way the item is in the accent colour, a heavier weight and has a 3px bar at its top edge, so it is told apart by shape too.
`onmore` adds a More item that opens the drawer; `moreBadge` carries a count from a link that lives in the drawer, `moreOpen` sets its `aria-expanded`, `moreControls` is the drawer's id for `aria-controls`, and `moreLabel` and `moreIcon` change its look.
`moreActive` gives More the active look when the page shown is one that lives in the drawer; it is a menu button, so it carries no `aria-current` and the drawer's own item marks the page.
`label` names the `<nav>` (default "Main pages"), distinct from the sidebar's "Navigation".
The bar is fixed at the bottom under the [phone query](#phone-query), `--tab-bar-height` (3.5rem) tall plus `env(safe-area-inset-bottom)`, and hidden elsewhere.
Labels wrap to two lines under large text or zoom instead of ellipsizing; the bar then grows, and sets `--tab-bar-height` on `<html>` to its measured height, so padding and the Toast anchor that read the token follow it.
Pad the page bottom so content clears it:

```css
@media (max-width: 860px) and (pointer: coarse) {
  main {
    padding-bottom: calc(2rem + var(--tab-bar-height) + env(safe-area-inset-bottom));
  }
}
```

A badge sits on the icon's top right corner, ringed in the bar's colour, so it covers only the corner.

`variant="pill"` floats the items and More as one rounded group, inset from the screen edges and the safe areas, with the page between and beside it still reachable.
The page shown is a filled capsule with an accent ring instead of the edge bar; the pill is at most 30rem wide and centred, and labels break between words only.
The pill is taller than the bar, at least `--tab-pill-min-height` (4rem) with 24px icons and labels from `--text-xs` on the narrowest phones up to `--text-sm` from about 380px wide, and `--tab-bar-height` follows its measured height as for the bar.
`onsearch` adds a round search button the pill's floor height beside it, such as one opening [PageSearch](#page-search); `searchLabel` names it (default "Search pages"), and it carries `aria-haspopup="dialog"`.
The button takes focus before `onsearch` runs, since iOS does not focus a tapped button, so the dialog gives focus back to it on close; `searchOpen` is ignored since v0.14.1.
The pill sits `--space-2` above the bottom edge, or right above the home indicator, and `--tab-bar-height` includes that gap, so the same padding clears it.
A pill for the installed app only, keeping the bar in the browser:

```svelte
<script lang="ts">
  const standalone = window.matchMedia('(display-mode: standalone)').matches;
  let pageSearch = $state<ReturnType<typeof PageSearch>>();
</script>

<TabBar items={tabs} variant={standalone ? 'pill' : 'bar'} onsearch={() => pageSearch?.show()} />
<PageSearch bind:this={pageSearch} pages={allPages} />
```

### Page search

```svelte
<script lang="ts">
  import { PageSearch, type PageSearchItem } from '@firetailhosting/solscope-ui';
  const pages: PageSearchItem[] = [
    { href: '/', label: 'Dashboard', icon: 'dashboard', section: 'Overview', active: true },
    { href: '/orders', label: 'Orders', icon: 'orders', section: 'Trading' }
  ];
  let open = $state(false);
  let search = $state<ReturnType<typeof PageSearch>>();
</script>

<Button icon="search" onclick={() => search?.show()}>Search pages</Button>
<PageSearch bind:this={search} bind:open {pages} />
```

Each page has a unique `href`, a `label`, an `icon`, an optional `section` shown beside it, an optional `badge` count read out as unread, and `active` as on TabBar items: `true` or `'page'` for the page shown, `'section'` for a page under it.
The page shown has a bar at its start edge as well as the accent colour.
It reuses [Dialog](#dialog): a sheet on phones and a card elsewhere, a fixed height so the field stays put as the list shrinks.
Open it with `show()` from the tap: it opens and focuses the field synchronously, which iOS needs to raise the keyboard; setting `open` also works, without the keyboard on iOS.
The field empties each time; every word typed must start a word of the label or section, and labels starting with the first word come first.
Return goes to the first match, Down moves into the list, Up and Down move through it, Home and End jump to its ends, and Up from the first goes back to the field.
The number of matches is read out once typing pauses, and `emptyText` shows when nothing matches.
`title` (default "Search pages", the search button's name), `fieldLabel` and `placeholder` change the wording; `filterPages(pages, query)` is the same filter for code and tests.

#### Sections

`sections` adds result sections under the pages, which the app fills from its own search as the bound `query` changes:

```svelte
<script lang="ts">
  import { PageSearch, type PageSearchSection } from '@firetailhosting/solscope-ui';
  let query = $state('');
  let coins = $state<PageSearchSection>({ id: 'coins', title: 'Coins', noun: ['coin', 'coins'], results: [] });
  // Set coins.loading while searching, then its results (href, label, detail, value, valueLabel, image) or a fixed error.
</script>

<PageSearch bind:this={search} bind:query {pages} sections={query.trim() ? [coins] : []} pageLimit={3} />
```

Given, even empty, the pages become a section too, titled `pagesTitle` (default "Pages"), with at most `pageLimit` pages once something is typed.
Each section heading is a button with `aria-expanded` and `aria-controls` that opens and closes it; the chevron points down when open and turns when closed, and the count beside it shows "--" while loading.
All open on first use; `closedSections` holds the ids closed (`'pages'` for the pages), so bind it to keep them closed for the session.
`loading` shows three skeleton rows the size of results, hidden from screen readers, and the heading reads "Coins, loading"; `error` shows its fixed text, and an empty section shows its `emptyText` or `noMatchesText` (default "No matches").
`searched: false` marks a section the app has not searched, such as one it skips while closed: its count shows "--".
Return goes to the first result of the open sections, and Down, Up, Home and End move across sections, skipping closed ones.
One status reads out the count of every open section, such as "3 pages, 5 coins", once typing pauses and no open section is loading, also when a new query gives the same count; `countPhrase` and `searchSummary` build it for tests.
`maxlength` limits the field; there is no limit by default.

### Inline confirm

```svelte
{#if archiving}
  <InlineConfirm
    question="Archive this bot?"
    detail="It stops and returns what it can to your account."
    confirmLabel="Archive"
    busyLabel="Archiving..."
    danger
    busy={archiveBusy}
    trigger={() => document.getElementById('archive-button')}
    onconfirm={archive}
    oncancel={() => (archiving = false)}
  />
{:else}
  <Button id="archive-button" variant="danger" onclick={() => (archiving = true)}>Archive bot</Button>
{/if}
```

Render it in place of the button that asked; the question takes focus and the panel scrolls into view.
`question` and `detail` are text or snippets, and children go between the question and the buttons.
Escape and Cancel call `oncancel`, then focus goes back to `trigger`, an element or a function that finds one, or to whatever had focus when the panel opened.
`danger` makes the confirm button red instead of primary.
Set `busy` while the action runs: the group is `aria-busy`, both buttons are `aria-disabled` and ignore presses, and the confirm button shows `busyLabel`.

### Row list

```svelte
<Card flush>
  <RowList label="Bots" busy={!bots}>
    {#each bots as bot (bot.id)}
      <RowItem href="/bots/{bot.id}" value={usd(bot.value)} valueLabel="Value" detail={bot.status} noteLabel="Return">
        <Avatar name={bot.name} /> {bot.name}
        {#snippet note()}<span class={tone}>{pct(bot.change)}</span>{/snippet}
        {#snippet actions()}<Button size="sm">Pause</Button>{/snippet}
      </RowItem>
    {/each}
  </RowList>
</Card>
```

A row is two columns of up to two lines: children and `detail` on the left, `value` and `note` on the right, the second line muted.
Each cell is text or a snippet, so a skeleton row takes the same shape.
`valueLabel` and `noteLabel` are read before a bare number and not shown.
With `href` the row is one link, 44px tall under a finger, with `actions` outside it at the end.
It is the phone shape of a Table: show one or the other from the [phone query](#phone-query).

### Back link

```svelte
<BackLink href="/markets" hideInStandalone>Markets</BackLink>
<BackLink href="/markets" variant="link" hideInStandalone>Markets</BackLink>
```

A muted link with a left arrow above the page head, as the app's own back links looked.
`variant="link"` keeps the browser's default link look instead, underlined in the text colour and size, as a page's own back link had on desktop.
Under the [phone query](#phone-query) it is 44px tall with the same space under it, and `hideInStandalone` hides it when the page runs from the home screen there, where the app's top bar has its own Back button.

### Pagination

```svelte
<Pagination page={page} totalItems={340} perPage={25} onpage={(next) => load(next)} label="Bot runs pages" disabled={loading} />
```

The app owns `page`: `onpage` gets the requested page, and the app loads it and passes the new `page` back.
`page` is the page currently shown: set it when the new rows arrive, not when the request starts, and set `disabled` while it loads.
It renders a `<nav>` named by `label` (default "Pagination") with the buttons, "Page 2 of 14" and the range "26-50 of 340".
With no items it renders nothing; with one page it shows only the range.
At the first and last page, and while `disabled`, the buttons are `aria-disabled` rather than disabled, so the pressed button keeps focus.
The visible "Page 3 of 14" is a polite status region, so it is announced once, when the new rows land.
The range wraps under the buttons on narrow screens.

### Toast

```svelte
{#if updateReady}
  <Toast
    message="New version available."
    actionLabel="Reload"
    busyLabel="Reloading..."
    onaction={reload}
    actionBusy={reloading}
    dismissText="Later"
    ondismiss={() => (updateReady = false)}
  />
{/if}
```

A small card fixed over the page, so it never moves the layout: at the bottom right, or centred above the TabBar under the [phone query](#phone-query).
`message` is one line of text or a snippet; `actionLabel` adds a small primary button that calls `onaction`, and `ondismiss` adds an x button named by `dismissLabel` (default "Dismiss").
`dismissText` shows a word such as "Later" on the dismiss button instead of the x; it is then the button's name too, so a voice control user says what they see.
Set `actionBusy` while the action runs: the button is `aria-busy`, shows `busyLabel` and ignores presses, but is never disabled, so it keeps focus.
It is a `status` live region, so the message is announced once when the toast appears without taking focus; `live="off"` keeps it quiet.
The buttons sit in the normal tab order, and Escape while focus is inside calls `ondismiss`.
After a dismiss from the button or Escape, focus goes back to the element that had it before focus entered the toast, or to `main`, given `tabindex="-1"` if it needs one.
It fades and slides in, with no motion under reduced motion, and sits above the TabBar and under the drawer and any Dialog.
Mounted toasts stack on their own, with nothing for the app to pass: the newest sits at the anchor and older ones are pushed up above it, 0.5rem apart, so an app-wide "Update available" toast never covers a page's "Removed X. Undo" one.
The stack sets `--toast-stack-height` on `<html>`: the heights of the mounted toasts plus a 0.5rem gap for each, in px, removed when none is mounted.
Add it to the page's scroll padding, so an element scrolled or focused into view stops clear of the toasts:

```css
html {
  scroll-padding-bottom: calc(1rem + var(--toast-stack-height, 0px));
}
```

### Home-screen app

The library is laid out for a page saved to a phone's home screen, where there is no browser chrome.
Set `viewport-fit=cover` in the app's viewport meta so `env(safe-area-inset-*)` is not zero; the Sidebar drawer, Dialog sheet and TabBar pad themselves with it, and the app pads its own top bar and footer.
Under 860px the page scroll is locked while the drawer or a Dialog is open: on a phone the body is pinned at its scroll position, which comes back when the lock lifts or the screen widens, and in a mouse window the scrollbar's width stays as padding so nothing shifts.
`lockScroll()` is exported for an app's own overlays and returns the function that releases the lock.
Under `(pointer: coarse)` every control is at least 44px tall and form controls are 16px, so iOS does not zoom in on focus; an app that sizes bare inputs itself must set 16px there too.
Tap highlights are off, controls cannot be selected, buttons have no long-press menu while links keep theirs, and buttons, links and nav items show a pressed state where there is no hover.
Installed as a standalone app, the page no longer rubber-bands at its ends, so the fixed bars stay put.

### Fonts

The four Plex files load with `font-display: swap`, so on a slow connection the text swaps visibly once they arrive.
Preload the two that most text uses, Regular (400) and SemiBold (600), from the app's root layout; the files are exported under `fonts/`, and Vite gives the preload and the stylesheet the same URL:

```svelte
<script>
  import plexRegular from '@firetailhosting/solscope-ui/fonts/IBMPlexSans-Regular.woff2';
  import plexSemiBold from '@firetailhosting/solscope-ui/fonts/IBMPlexSans-SemiBold.woff2';
</script>

<svelte:head>
  <link rel="preload" href={plexRegular} as="font" type="font/woff2" crossorigin="anonymous" />
  <link rel="preload" href={plexSemiBold} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>
```

Medium (500) and Bold (700) are used less and can load on demand.

### Series chart

`SeriesChart` draws `points` (`{ t, p }`, with `o`, `h`, `l` and `v` for a candle) as a line over a gradient fill, or as candles with `kind="candles"` when every point carries an open, high and low.
It fits the data rather than zero, or keeps zero in view with `baseline`, where the line above zero reads as gain and below as loss.
Round-value `guides` run across the plot with labels at the left edge, kept out of the `timeAxis` row along the bottom and down to one on a plot under 150px tall, and `live` pulses the last point three times, and again when a new last point arrives.
Rising candles are hollow and falling ones filled, so direction does not rest on colour alone.
Candles under 3px wide, as many in a narrow plot, are a high-low line with a thicker body line, so at that density rise and fall show by colour and the readout names each candle's open and close; a doji is a level line with its wick through it.
Placed by time, candles size to the closest two, so a burst never overlaps.
A pointer shows a crosshair, a value tag and a tooltip; a finger drags and reads the readout under the chart, which stays after it lifts; the keyboard moves a hidden slider that announces each point, a candle as open, high, low and close; Escape hides the tooltip.
An inspected point stays on its moment when new points arrive, so a live tick does not move it; it ends when that moment is gone.
Only what an inspection shows is a live region, never the hint, so a hint that changes with each tick is not read out.
`markers` place trades on the line as buttons that can be hovered, tapped or focused, and `change` adds each point's change since the first; see [Trade markers](#trade-markers).
`format`, `formatTime` and `formatDay` say how values and times read, and `axisFormat` (by default `format`) how the plot's guide, zero and level labels read, so they can be shorter than the readout; `byTime` places points by time so gaps show and `gap` breaks the line across them; `fixed` keeps `height` in pixels at any width.
A new series, another range or kind, wipes in from the left, a live tick does not, and nothing moves under reduced motion; `animate={false}` turns it off.
The picture is an image to screen readers, named by `label` and described by `summary`, by default a sentence with the span, start, end, high and low, then the levels, also in the reading order as visually hidden text; the slider is not described by it, so it is read once.
[LayerChart](https://layerchart.com) draws the series in SVG from a chunk of its own, with only the pieces it uses, loaded once a chart mounts, so server rendering and pages without a chart never load it.
Everything read or reached is DOM over the picture, placed with the chart's own scales and moved on every resize: the labels, levels, crosshair, tooltip, slider and markers.
The readout sits right under the plot, a `--space-2` gap below it, with no attribution row.
The placement maths is exported too (`plotPoints`, `valueBounds`, `guideValues`, `markersInTime`, `markersInRange`, `boundsWithMarkers`, `xAtTime`, `levelsInRange`, `boundsWithLevels`, `placeLevels`, `stackLabels`, `clusterMarkers` and the rest) with the date helpers `chartTime`, `chartDay`, `axisTime` and `spansYears`, also from `@firetailhosting/solscope-ui/chart`, which carries no Svelte component, so plain modules and their tests can import it.

```svelte
<SeriesChart points={history} kind={candles ? 'candles' : 'line'} markers={trades} byTime live levels={levels} format={usd} change={signedUsd} />
```

#### Trade markers

```ts
const trades: SeriesMarker[] = [
  { t, price, side: 'buy', title: 'Maya bought 1,200,000 BONK for $0.50', avatar: '/api/files/users/abc/maya.webp', name: 'Maya' }
];
```

Each marker is `{ t, price, side, title }` with an optional `note`, `avatar` (the trader's picture, a person's or a bot's) and `name`.
A picture shows in an 18px circle with a ring in the side's colour and a small up or down badge, so buy and sell never rest on colour.
Without a picture, while it loads, or when it fails, the circle shows the initials of `name`; without either, the buy or sell shape.
Pictures load once the chart nears the screen, only for the markers drawn, and each is fetched and decoded once per page and shared by every chart; one that fails is not tried again.
Pass only pictures the viewer may already see; the chart shows what it is given.
Markers closer than 28px, 36px on a touch screen, group into one button with a "+N" count, so none covers another; a group's name starts with its visible count, "+11 more, 12 trades", then lists up to three trades, or says "from ... to ...: 7 buys, 5 sells", or "at ...: 4 buys, 2 sells" when every time reads the same.
Hover or focus shows a trade or a group's count in the readout, with no floating tooltip; a press picks it with a ring, a trade with `aria-pressed` and a group as a disclosure with `aria-expanded` and `aria-controls` on the list of its trades, which scrolls past four.
The readout speaks only when a press changes the pick, "12 trades picked", so a pick shown again after focus moves on is not read twice.
Targets are 24px, 44px on a touch screen; the markers come after the slider in the tab order, in time order.
A trade priced a little outside the series, up to 5% of its range, as a fill just under a 1-minute candle's low, widens the view to fit, so it sits at its true price inside the plot; one further off is left out.

#### Price levels

```ts
const levels: SeriesLevel[] = [
  { key: order.id, value: order.limit, label: 'Limit buy', dashed: true },
  { key: 'tp', value: takeProfit, label: 'Take profit', tone: 'up' },
  { key: 'sl', value: stopLoss, label: 'Stop loss', tone: 'down' }
];
```

Each level is `{ key, value, label }` with an optional `tone` (`up`, `down` or `neutral`, the default) and `dashed`, such as for a pending order.
It draws as a 1px line across the plot with a tag at the right edge, its label and value in `axisFormat`; the tag's words say what it is, so the tone's colour is never the only signal.
A level updates in place by `key`, so a live price moving a trailing stop does not redraw the rest.
One a little outside the prices, up to 10% of their range (`LEVEL_PRICE_TOLERANCE`), widens the view to fit, as a trade does; one further off is pinned to the top or bottom edge, a tag with an up or down arrow and its value and no line, so it never flattens the series.
Tags move apart so none covers another, stay out of the time axis row and sit over the markers, which still take presses through them.
Screen readers hear the levels after the summary, "Take profit at $0.0123", and "Stop loss at $0.0040, below the chart" for a pinned one.

### Range picker

```svelte
<script lang="ts">
  import { RangePicker, type RangeOption } from '@firetailhosting/solscope-ui';
  const ranges: RangeOption<number>[] = [
    { value: 1, label: '24H' },
    { value: 7, label: '7D' },
    { value: 30, label: '30D' },
    { value: 365, label: '1Y', disabled: true }
  ];
  let days = $state(7);
</script>

<RangePicker label="Chart range" options={ranges} bind:value={days} onchange={load} collapseBelow={480} />
```

Options are `{ value, label, disabled? }`, the same shape as `SegmentedOption`, and values can be numbers or strings.
At `collapseBelow` pixels of screen width and up it shows a [SegmentedControl](#segmented-control); below, a native select named by `label`, which a phone opens as its own picker.
Both are rendered and a media query shows one, so the server renders the right one and nothing jumps when the page starts; `collapseBelow={0}` keeps the buttons.
A value no option has selects nothing.

### Charts

Adapted from [shadcn-svelte's charts](https://shadcn-svelte.com/docs/components/chart).
Draw the chart with LayerChart and wrap it in `ChartContainer`.
Series colours come from `--chart-1` to `--chart-5`; use them in that order, since adjacent pairs are checked for colour-blind separation.

```svelte
<script lang="ts">
  import { ChartContainer, ChartTooltip, type ChartConfig } from '@firetailhosting/solscope-ui';
  import { BarChart } from 'layerchart';

  const data = [{ month: 'Aug', buys: 27, sells: 15 }, { month: 'Sep', buys: 19, sells: 12 }];
  const config = {
    buys: { label: 'Buys', color: 'var(--chart-1)' },
    sells: { label: 'Sells', color: 'var(--chart-2)' },
  } satisfies ChartConfig;
</script>

<ChartContainer {config}>
  <BarChart
    {data}
    x="month"
    seriesLayout="group"
    legend
    series={[
      { key: 'buys', label: config.buys.label, color: config.buys.color },
      { key: 'sells', label: config.sells.label, color: config.sells.color },
    ]}
  >
    {#snippet tooltip()}<ChartTooltip />{/snippet}
  </BarChart>
</ChartContainer>
```

For a custom chart, the library re-exports the LayerChart pieces `Chart`, `Svg`, `Html`, `Area`, `Spline`, `Circle`, `RectClipPath` and the `ChartState` type.
Import them from the library rather than `layerchart`, so the app uses the library's LayerChart version:

```svelte
<script lang="ts">
  import { Area, Chart, ChartContainer, ChartTooltip, Spline, Svg } from '@firetailhosting/solscope-ui';
</script>
```

The package is marked free of side effects apart from its CSS, so pages that use no chart do not download LayerChart.

## Releasing

Run `bun test`, `bun run check` and `bun run package`, which regenerates `src/lib/theme-tokens.ts` and `dist/`, commit both, then tag the release:

```
git tag v0.2.0
git push origin v0.2.0
```
