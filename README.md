# solscope-ui

UI component library for [solscope](https://github.com/FiretailHosting/solscope).
Built on Svelte 5 with a shadcn-inspired design system.
Dark and light mode, CSS variable theming.

## Install

```
npm install @firetailhosting/solscope-ui
```

Requires a `.npmrc` pointing `@firetailhosting` at GitHub Packages:

```
@firetailhosting:registry=https://npm.pkg.github.com
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
| `Alert` | Error, notice, and success messages |
| `AppShell` | Full-page layout wrapper with sidebar slot |
| `Badge` | Inline status badge (default, up, down, accent) |
| `Button` | Button with variants: default, primary, danger, ghost |
| `Card` | Content container with border and background |
| `FormField` | Label + input + hint wrapper |
| `Grid` | Responsive 2-column grid |
| `Input` | Styled text input |
| `Label` | Form label |
| `ModeSwitch` | Paper/Live trading mode toggle |
| `PageHead` | Page title with optional actions row |
| `Pill` | Status pill (default, live, ok) |
| `Select` | Styled select dropdown |
| `SegmentedControl` | Tab-style button group |
| `Separator` | Horizontal or vertical rule |
| `Sidebar` | Collapsible navigation sidebar |
| `SidebarNavItem` | Sidebar navigation link with active state and badge |
| `Stat` | Stat tile with label and value |
| `Table` | Styled data table with overflow scroll |
| `Textarea` | Styled textarea |
| `ThemeToggle` | Cycles through auto/light/dark themes |

## Theming

Colors are defined as CSS variables in `tokens.css`.
The sidebar uses separate `--sidebar-*` tokens for flexibility.
Override any token in your app's CSS to customize.

### Sidebar layout

```svelte
<!-- +layout.svelte -->
<script>
  import { AppShell, Sidebar, SidebarNavItem } from '@firetailhosting/solscope-ui';
  import { page } from '$app/state';

  let sidebarOpen = $state(true);

  const links = [
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/orders', label: 'Orders' },
    { href: '/bots', label: 'Bots' },
  ];
</script>

<AppShell>
  {#snippet sidebar()}
    <Sidebar bind:open={sidebarOpen}>
      {#snippet header()}
        <a href="/" style="font-weight: 650;">solscope</a>
      {/snippet}
      {#each links as link}
        <SidebarNavItem href={link.href} active={page.url.pathname.startsWith(link.href)}>
          {link.label}
        </SidebarNavItem>
      {/each}
    </Sidebar>
  {/snippet}
  <main>{@render children()}</main>
</AppShell>
```

## Publishing

Tag a release to publish to GitHub Packages:

```
git tag v0.1.0
git push origin v0.1.0
```
