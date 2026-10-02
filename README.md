| `Toast` | A one-line notice fixed over the page with an action and a dismiss button, announced once, never taking focus and giving it back on dismiss; mounted toasts stack and publish `--toast-stack-height`; see [Toast](#toast) |
# solscope-ui

UI component library for [solscope](https://github.com/FiretailHosting/solscope).
Built on Svelte 5 with a flat, corporate design: neutral greys, one navy accent, no gradients or shadows.
Dark and light mode, CSS variable theming, and a technical icon set drawn for the library.
Charts are the one part with a dependency: [LayerChart](https://layerchart.com).

## Install

The built `dist/` is committed, so the package installs straight from a tag with no registry or token:

```
"@firetailhosting/solscope-ui": "github:FiretailHosting/solscope-ui#v0.11.0"
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
| `Button` | Button or link (`href`), variants default, primary, danger, ghost, optional `icon`; `loading` shows a spinner, blocks clicks and keeps the width; `aria-disabled="true"` dims it but keeps it focusable and tappable, so a press can say why; a dimmed primary loses its fill for a dashed outline, so the state does not rest on colour alone |
| `Card` | Container with an optional header: `title`, `icon`, `actions`; `flush` for edge-to-edge tables |
| `ChartContainer` | Wraps a LayerChart chart: themes it from the tokens and sets `--color-<key>` for each series in `config` |
| `ChartTooltip` | Tooltip for a chart inside `ChartContainer`, with `indicator` dot, line or dashed; no glide or fade under reduced motion; `aria-hidden` goes on its outermost element |
| `Dialog` | Modal over a native `<dialog>`: `title` or `label`, close button, Escape, backdrop tap, focus return; a centred card on desktop and a bottom sheet on phones; see [Dialog](#dialog) |
| `EmptyState` | Icon, title, text and actions for a list with nothing in it |
| `FormField` | Label wrapping an input, with a `hint` or an `error` |
| `Grid` | Responsive 2-column grid |
| `Icon` | One of the library's icons by `name`; decorative unless given a `label` |
| `InlineConfirm` | A question asked in place before an action that cannot be undone, with confirm and cancel buttons; see [Inline confirm](#inline-confirm) |
| `Input` | Styled text input |
| `Label` | Form label |
| `ModeSwitch` | Paper/Live trading mode toggle; `onliveunavailable` keeps Live clickable when `liveEnabled` is false |
| `PageHead` | Page title with optional actions row |
| `Pagination` | Previous and Next buttons, "Page 2 of 14" and the row range for a long table; see [Pagination](#pagination) |
| `Pill` | Status pill (default, live, ok) |
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
| `TabBar` | Phone bottom bar with the main destinations, the page shown marked by a bar at the top edge and `aria-current`, and a More item that opens the drawer; labels wrap to two lines; shown only on phones; see [Tab bar](#tab-bar) |
| `Table` | Styled data table with overflow scroll; `rowHover={false}` turns off the row highlight for rows that are not clickable |
| `Textarea` | Styled textarea |
| `ThemeToggle` | Cycles through auto, light and dark themes and saves the choice; see [Saved theme](#saved-theme) |

## Icons

`Icon` draws from `icons`, a map of 24px line icons with chamfered corners and small node dots.
`bun run dev` opens a gallery of every icon and component.
Add an icon by adding its paths to `src/lib/icons/icons.ts`.

## Theming

Colors are defined as CSS variables in `tokens.css`.
Text uses IBM Plex Sans 1.1 (weights 400 to 700), self-hosted from `fonts/` under the SIL Open Font License, with the system font stack as a fallback.
The sidebar is dark slate in both themes, with its own `--sidebar-*` tokens.
Override any token in your app's CSS to customize.
Component classes are prefixed `sui-` so they cannot collide with an app's own class names.

### Saved theme

`ThemeToggle` saves the chosen theme in `localStorage`, but it only runs once the app's JavaScript starts.
To stop a saved Dark theme flashing light on every page load, add this script to the `<head>` of `src/app.html`, before `%sveltekit.head%`:

```html
<script>(function () { try { var theme = localStorage.getItem("theme"); if (theme === "light" || theme === "dark") document.documentElement.setAttribute("data-theme", theme); } catch (error) {} })();</script>
```

It is the library's `themeInitScript` export, so check it still matches after upgrading.
It does nothing when the theme is Auto or storage is blocked.

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
    ondismiss={() => (updateReady = false)}
  />
{/if}
```

A small card fixed over the page, so it never moves the layout: at the bottom right, or centred above the TabBar under the [phone query](#phone-query).
`message` is one line of text or a snippet; `actionLabel` adds a small primary button that calls `onaction`, and `ondismiss` adds an x button named by `dismissLabel` (default "Dismiss").
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

Run `bun run package` so `dist/` is current, commit it, then tag the release:

```
git tag v0.2.0
git push origin v0.2.0
```
