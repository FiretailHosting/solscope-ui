# solscope-ui

UI component library for [solscope](https://github.com/FiretailHosting/solscope).
Built on Svelte 5 with a flat, corporate design: neutral greys, one navy accent, no gradients or shadows.
Dark and light mode, CSS variable theming, and a technical icon set drawn for the library, with no dependencies.

## Install

The built `dist/` is committed, so the package installs straight from a tag with no registry or token:

```
"@firetailhosting/solscope-ui": "github:FiretailHosting/solscope-ui#v0.6.0"
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
| `Alert` | Notice, warning, error and success messages |
| `AppShell` | Full-page layout wrapper with sidebar slot |
| `Badge` | Inline status badge (default, up, down, accent) |
| `Button` | Button or link (`href`), variants default, primary, danger, ghost, optional `icon` |
| `Card` | Container with an optional header: `title`, `icon`, `actions`; `flush` for edge-to-edge tables |
| `EmptyState` | Icon, title, text and actions for a list with nothing in it |
| `FormField` | Label + input + hint wrapper |
| `Grid` | Responsive 2-column grid |
| `Icon` | One of the library's icons by `name`; decorative unless given a `label` |
| `Input` | Styled text input |
| `Label` | Form label |
| `ModeSwitch` | Paper/Live trading mode toggle; `onliveunavailable` keeps Live clickable when `liveEnabled` is false |
| `PageHead` | Page title with optional actions row |
| `Pill` | Status pill (default, live, ok) |
| `Select` | Styled select dropdown |
| `SegmentedControl` | Tab-style button group |
| `Separator` | Horizontal or vertical rule |
| `Sidebar` | Navigation sidebar; always shown on wide screens, `open` slides it in on narrow ones |
| `SidebarNavItem` | Sidebar link with `icon`, active state and badge |
| `SidebarSection` | Titled group of sidebar links |
| `Skeleton` | Pulsing grey placeholder for loading content: `width`, `height`, `radius`; hidden from screen readers |
| `Stat` | Stat tile with label, value, `hint` (toned up or down), `icon`, optional `href`; `loading` shows a placeholder value |
| `Table` | Styled data table with overflow scroll |
| `Textarea` | Styled textarea |
| `ThemeToggle` | Cycles through auto/light/dark themes |

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

## Releasing

Run `bun run package` so `dist/` is current, commit it, then tag the release:

```
git tag v0.2.0
git push origin v0.2.0
```
