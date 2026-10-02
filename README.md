# solscope-ui

UI component library for [solscope](https://github.com/FiretailHosting/solscope).
Built on Svelte 5 with a flat, corporate design: neutral greys, one navy accent, no gradients or shadows.
Dark and light mode, CSS variable theming, and a technical icon set drawn for the library.
Charts are the one part with a dependency: [LayerChart](https://layerchart.com).

## Install

The built `dist/` is committed, so the package installs straight from a tag with no registry or token:

```
"@firetailhosting/solscope-ui": "github:FiretailHosting/solscope-ui#v0.7.0"
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
| `Badge` | Inline status badge (default, up, down, accent) |
| `Button` | Button or link (`href`), variants default, primary, danger, ghost, optional `icon`; `loading` shows a spinner, blocks clicks and keeps the width |
| `Card` | Container with an optional header: `title`, `icon`, `actions`; `flush` for edge-to-edge tables |
| `ChartContainer` | Wraps a LayerChart chart: themes it from the tokens and sets `--color-<key>` for each series in `config` |
| `ChartTooltip` | Tooltip for a chart inside `ChartContainer`, with `indicator` dot, line or dashed |
| `EmptyState` | Icon, title, text and actions for a list with nothing in it |
| `FormField` | Label wrapping an input, with a `hint` or an `error` |
| `Grid` | Responsive 2-column grid |
| `Icon` | One of the library's icons by `name`; decorative unless given a `label` |
| `Input` | Styled text input |
| `Label` | Form label |
| `ModeSwitch` | Paper/Live trading mode toggle; `onliveunavailable` keeps Live clickable when `liveEnabled` is false |
| `PageHead` | Page title with optional actions row |
| `Pill` | Status pill (default, live, ok) |
| `Select` | Styled select dropdown |
| `SegmentedControl` | Tab-style button group: `options` with `bind:value` and `onchange`, or your own `<button>` children with `class:active` |
| `Separator` | Horizontal or vertical rule |
| `Sidebar` | Navigation sidebar; always shown on wide screens, `open` slides it in on narrow ones |
| `SidebarNavItem` | Sidebar link with `icon`, active state and badge |
| `SidebarSection` | Titled group of sidebar links |
| `Skeleton` | Pulsing grey placeholder for loading content: `width`, `height`, `radius`; hidden from screen readers |
| `Stat` | Stat tile with label, value, `hint` (toned up or down), `icon`, optional `href`; `loading` shows a placeholder value |
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
    <Sidebar bind:open={menuOpen}>
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

## Releasing

Run `bun run package` so `dist/` is current, commit it, then tag the release:

```
git tag v0.2.0
git push origin v0.2.0
```
