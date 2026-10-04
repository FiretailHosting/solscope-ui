<script lang="ts">
	import {
		Alert,
		BackLink,
		Badge,
		Balance,
		Button,
		Card,
		ChartContainer,
		Dialog,
		ChartTooltip,
		EmptyState,
		FormField,
		Icon,
		icons,
		InlineConfirm,
		Input,
		ModeSwitch,
		PageHead,
		PageSearch,
		Pagination,
		Pill,
		RowItem,
		RowList,
		SegmentedControl,
		Select,
		SeriesChart,
		Skeleton,
		Stat,
		TabBar,
		Table,
		ThemeToggle,
		Toast,
		type ChartConfig,
		type IconName,
		type PageSearchItem,
		type PageSearchResult,
		type PageSearchSection,
		type SegmentedOption,
		type TabBarItem
	} from '$lib';
	import { BarChart, LineChart } from 'layerchart';

	// A gallery of the library, for checking changes by eye: `bun run dev`.
	const names = Object.keys(icons) as IconName[];
	let tab = $state('one');
	type Range = '1d' | '1w' | '1m' | 'all';
	const ranges: SegmentedOption<Range>[] = [
		{ value: '1d', label: '1D' },
		{ value: '1w', label: '1W' },
		{ value: '1m', label: '1M' },
		{ value: 'all', label: 'All', disabled: true }
	];
	let range = $state<Range>('1w');

	// Pagination with a made-up load, so the disabled state shows between pages.
	let ordersPage = $state(1);
	let ordersLoading = $state(false);
	function loadOrdersPage(nextPage: number) {
		ordersLoading = true;
		setTimeout(() => {
			ordersPage = nextPage;
			ordersLoading = false;
		}, 400);
	}

	// Made-up but steady account values, so the charts look the same on every load.
	const hour = 60 * 60 * 1000;
	const now = new Date('2026-10-01T16:00:00Z').getTime();
	function valueSeries(points: number, step: number) {
		return Array.from({ length: points }, (_, index) => ({
			date: new Date(now - (points - 1 - index) * step),
			value: Math.round(9000 + index * (550 / points) + Math.sin(index * 1.7) * 120)
		}));
	}
	const valueByRange: Record<Range, { date: Date; value: number }[]> = {
		'1d': valueSeries(24, hour),
		'1w': valueSeries(7, 24 * hour),
		'1m': valueSeries(30, 24 * hour),
		all: []
	};
	const valueConfig = {
		value: { label: 'Account value', color: 'var(--chart-1)' }
	} satisfies ChartConfig;
	const formatUsd = (value: number) =>
		value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
	const formatAxisDate = (date: Date) =>
		range === '1d'
			? date.toLocaleTimeString('en-US', { hour: 'numeric', timeZone: 'UTC' })
			: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

	// A made-up token price: hourly candles over a week, with a drift and a
	// wobble so the line and the candles have something to show.
	const priceSeries = Array.from({ length: 168 }, (_, index) => {
		const t = now - (167 - index) * hour;
		const base = 0.0042 + index * 0.000004 + Math.sin(index / 9) * 0.0004 + Math.sin(index / 2.3) * 0.00012;
		const o = base + Math.cos(index * 1.3) * 0.00008;
		const p = base + Math.sin(index * 2.1) * 0.00009;
		return { t, o, p, h: Math.max(o, p) + 0.00006, l: Math.min(o, p) - 0.00007, v: 1200 + (index % 7) * 300 };
	});
	let priceKind = $state<'line' | 'candles'>('line');
	const priceKinds = [
		{ value: 'line' as const, label: 'Line' },
		{ value: 'candles' as const, label: 'Candles' }
	];
	const formatPrice = (value: number) => `$${value.toFixed(5)}`;
	const priceMarkers = [
		{ t: now - 120 * hour, price: priceSeries[47].p, side: 'buy' as const, title: 'You bought 1,000,000 WIF for $4.20', note: { text: '+8.1% vs your buy', up: true } },
		{ t: now - 30 * hour, price: priceSeries[137].p, side: 'sell' as const, title: 'You sold 400,000 WIF for $1.90' }
	];
	// Profit and loss around zero, for the baseline chart.
	const pnlSeries = Array.from({ length: 48 }, (_, index) => ({ t: now - (47 - index) * hour, p: Math.round(Math.sin(index / 6) * 180 + index * 5 - 90) }));
	const signed = (value: number) => `${value < 0 ? '-' : '+'}$${Math.abs(value).toLocaleString('en-US')}`;

	const orders = [
		{ month: 'May', buys: 14, sells: 9 },
		{ month: 'Jun', buys: 22, sells: 17 },
		{ month: 'Jul', buys: 18, sells: 21 },
		{ month: 'Aug', buys: 27, sells: 15 },
		{ month: 'Sep', buys: 19, sells: 12 }
	];
	const ordersConfig = {
		buys: { label: 'Buys', color: 'var(--chart-1)' },
		sells: { label: 'Sells', color: 'var(--chart-2)' }
	} satisfies ChartConfig;
	let mode = $state<'paper' | 'live'>('paper');
	let liveHelp = $state(false);
	// Counts onclose calls: one per close, also when the footer button unmounts the open dialog.
	let liveHelpCloses = $state(0);
	let orderDetails = $state(false);
	let saving = $state(false);

	// The bar shows under PHONE_QUERY: a narrow window with touch emulation.
	// More is the active item when the page shown is not one of the tabs.
	let drawerOpen = $state(false);
	let moreActive = $state(false);
	// The floating pill, with the search button beside it opening PageSearch.
	let pillBar = $state(false);
	let pageSearchOpen = $state(false);
	let pageSearch = $state<ReturnType<typeof PageSearch>>();
	const searchPages: PageSearchItem[] = [
		{ href: '#dashboard', label: 'Dashboard', icon: 'dashboard', section: 'Overview', active: true },
		{ href: '#markets', label: 'Markets', icon: 'markets', section: 'Overview' },
		{ href: '#watchlist', label: 'Watchlist', icon: 'watchlist', section: 'Overview' },
		{ href: '#portfolio', label: 'Portfolio', icon: 'portfolio', section: 'Trading' },
		{ href: '#orders', label: 'Orders', icon: 'orders', section: 'Trading' },
		{ href: '#bots', label: 'Bots', icon: 'bots', section: 'Automation' },
		{ href: '#scores', label: 'Scores', icon: 'scores', section: 'Automation' },
		{ href: '#friends', label: 'Friends', icon: 'friends', section: 'Social' },
		{ href: '#inbox', label: 'Inbox', icon: 'inbox', section: 'Social', badge: 3 }
	];
	// With coins, PageSearch gets a second section the page fills itself, as
	// an app would from its API: skeletons for a moment, "fail" shows an error.
	let searchCoins = $state(false);
	let pageSearchQuery = $state('');
	let coinsLoading = $state(false);
	const galleryCoins: PageSearchResult[] = [
		{ href: '#bonk', label: 'Bonk', detail: 'BONK', value: '$0.00002', valueLabel: 'Price' },
		{ href: '#book', label: 'Book of Meme', detail: 'BOME', value: '$0.0061', valueLabel: 'Price' },
		{ href: '#sol', label: 'Solana', detail: 'SOL', value: '$148.20', valueLabel: 'Price' }
	];
	const typedCoins = $derived(pageSearchQuery.trim().toLowerCase());
	$effect(() => {
		if ([...typedCoins].length < 2) return;
		coinsLoading = true;
		const timer = setTimeout(() => (coinsLoading = false), 800);
		return () => clearTimeout(timer);
	});
	const coinSections = $derived<PageSearchSection[]>(
		[...typedCoins].length < 2
			? []
			: [
					{
						id: 'coins',
						title: 'Coins',
						noun: ['coin', 'coins'],
						loading: coinsLoading,
						error: typedCoins === 'fail' ? 'Could not search coins.' : undefined,
						results: galleryCoins.filter(
							(coin) =>
								coin.label.toLowerCase().includes(typedCoins) || coin.detail?.toLowerCase().includes(typedCoins)
						)
					}
				]
	);
	const tabs = $derived<TabBarItem[]>([
		{ href: '#dashboard', label: 'Dashboard', icon: 'dashboard', active: !moreActive },
		{ href: '#markets', label: 'Markets', icon: 'markets' },
		{ href: '#portfolio', label: 'Portfolio', icon: 'portfolio' },
		{ href: '#bots', label: 'Bots', icon: 'bots', badge: 2 }
	]);

	function startSaving() {
		saving = true;
		setTimeout(() => (saving = false), 2000);
	}

	// The update prompt the app shows: Reload pretends to run, then the toast goes.
	// A page's own Undo toast shown with it stacks above or below it.
	let updateToast = $state(false);
	let undoToast = $state(false);
	let reloading = $state(false);
	function reload() {
		reloading = true;
		setTimeout(() => {
			reloading = false;
			updateToast = false;
		}, 1500);
	}

	// An in-place confirm with a made-up action, so the busy state shows.
	// Cancel finds the button by id, since the row is re-rendered.
	let archiving = $state(false);
	let archiveBusy = $state(false);
	let archived = $state(false);
	function archive() {
		archiveBusy = true;
		setTimeout(() => {
			archiveBusy = false;
			archiving = false;
			archived = true;
		}, 1500);
	}

	// Rows as the app lists tokens and bots on a phone.
	let watched = $state([
		{ symbol: 'SOL', name: 'Solana', price: '$212.40' },
		{ symbol: 'JUP', name: 'Jupiter', price: '$0.3401' },
		{ symbol: 'BONK', name: 'Bonk', price: '$0.00001871' }
	]);
	const bots = [
		{ name: 'Momentum', value: '$4,120.55', status: 'Running', change: '+3.2% all time', tone: 'up' },
		{ name: 'Dip buyer', value: '$2,980.10', status: 'Paused', change: '-0.8% all time', tone: 'down' },
		{ name: 'New bot', value: '$0.00', status: 'Paused', change: '--', tone: '' }
	];
</script>

<main>
	<!-- The muted default, and the plain underlined link a page's own back link had. -->
	<div class="inline">
		<BackLink href="#top" hideInStandalone>Markets</BackLink>
		<BackLink href="#top" variant="link">Markets</BackLink>
	</div>
	<PageHead title="solscope-ui" subtitle="Flat, corporate components with a technical icon set.">
		{#snippet actions()}
			<ThemeToggle />
		{/snippet}
	</PageHead>

	<div class="stats">
		<Stat label="Account value" icon="portfolio" value="$9,550.26" hint="+2.40% all time" tone="up" />
		<Stat label="Cash available" icon="wallet" value="$9,275.00" hint="USDC not held by orders" />
		<Stat label="Bots running" icon="bots" value="1 of 2" hint="-0.80% this week" tone="down" />
		<Stat label="Loading" icon="clock" value="" hint="Value still loading" loading />
	</div>

	<div class="row">
		<Card title="Account value" icon="portfolio">
			{#snippet actions()}
				<SegmentedControl label="Chart range" options={ranges} bind:value={range} />
			{/snippet}
			<ChartContainer config={valueConfig}>
				<LineChart
					data={valueByRange[range]}
					x="date"
					y="value"
					yBaseline={null}
					yNice
					series={[{ key: 'value', label: valueConfig.value.label, color: valueConfig.value.color }]}
					props={{
						spline: { strokeWidth: 2 },
						xAxis: { format: formatAxisDate, ticks: 4 },
						yAxis: { format: formatUsd, ticks: 4 }
					}}
				>
					{#snippet tooltip()}
						<ChartTooltip
							indicator="line"
							labelFormatter={(date) => formatAxisDate(date as Date)}
						/>
					{/snippet}
				</LineChart>
			</ChartContainer>
		</Card>

		<Card title="Orders by month" icon="orders">
			<ChartContainer config={ordersConfig}>
				<BarChart
					data={orders}
					x="month"
					seriesLayout="group"
					groupPadding={0.1}
					legend
					series={[
						{ key: 'buys', label: ordersConfig.buys.label, color: ordersConfig.buys.color },
						{ key: 'sells', label: ordersConfig.sells.label, color: ordersConfig.sells.color }
					]}
					props={{
						bars: { stroke: 'none', rounded: 'top', radius: 4 },
						highlight: { area: { fill: 'none' } },
						yAxis: { ticks: 4 }
					}}
				>
					{#snippet tooltip()}
						<ChartTooltip indicator="dot" />
					{/snippet}
				</BarChart>
			</ChartContainer>
		</Card>
	</div>

	<div class="row">
		<Card title="Price history" icon="markets">
			{#snippet actions()}
				<SegmentedControl label="Chart kind" options={priceKinds} bind:value={priceKind} />
			{/snippet}
			<SeriesChart
				points={priceSeries}
				kind={priceKind}
				markers={priceMarkers}
				byTime
				live
				height={220}
				format={formatPrice}
				change={(difference) => `${difference < 0 ? '-' : '+'}$${Math.abs(difference).toFixed(5)}`}
			/>
		</Card>
		<Card title="Profit/loss" icon="portfolio">
			<SeriesChart points={pnlSeries} byTime baseline height={220} fixed format={signed} change={signed} noun="value" label="Profit/loss history" />
		</Card>
		<Card title="Short chart" icon="markets">
			<SeriesChart points={priceSeries.slice(-30)} kind="candles" byTime height={96} fixed format={formatPrice} label="Short price history" />
		</Card>
	</div>

	<Card title="Tokens" icon="settings">
		<div class="tokens">
			<ul class="scale" aria-label="Spacing scale">
				{#each ['0-5', '1', '1-5', '2', '2-5', '3', '3-5', '4', '5', '6', '7', '8', '10', '12'] as step (step)}
					<li><span class="space" style="width: var(--space-{step})"></span><code>--space-{step}</code></li>
				{/each}
			</ul>
			<ul class="scale" aria-label="Type scale">
				{#each ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as size (size)}
					<li><span style="font-size: var(--text-{size})">The quick brown fox</span><code>--text-{size}</code></li>
				{/each}
			</ul>
		</div>
	</Card>

	<Card title="Icons" icon="spark">
		<ul class="icons">
			{#each names as name (name)}
				<li><Icon {name} size={22} /><span>{name}</span></li>
			{/each}
		</ul>
	</Card>

	<div class="row">
		<Card title="Controls" icon="settings">
			{#snippet actions()}<Pill>Pill</Pill><Badge variant="up">Badge</Badge>{/snippet}
			<div class="stack">
				<div class="inline">
					<Button>Default</Button>
					<Button variant="primary" icon="plus">Primary</Button>
					<Button variant="danger" icon="close">Danger</Button>
					<Button variant="ghost">Ghost</Button>
				</div>
				<div class="inline">
					<Button variant="link">Link button</Button>
					<Button variant="link" aria-disabled="true">Dimmed link</Button>
					<span class="muted">in a line of text, <Button variant="link">Try again</Button> included.</span>
				</div>
				<Balance label="Cash available" title="1234.5678">
					$1,234.57
					{#snippet action()}<Button variant="link">Max</Button>{/snippet}
				</Balance>
				<Balance label="You hold" busy><Skeleton width="4.5rem" /></Balance>
				<Balance label="Balance unavailable">
					{#snippet action()}<Button variant="link">Retry</Button>{/snippet}
				</Balance>
				<div class="inline">
					<Button variant="primary" icon="plus" loading>Placing order</Button>
					<Button loading>Save</Button>
					<Button size="sm" loading>Small</Button>
					<Button variant="primary" onclick={startSaving} loading={saving}>Save changes</Button>
				</div>
				<!-- Unavailable but still focusable and tappable, so a press can say why. -->
				<div class="inline">
					<Button aria-disabled="true">Default</Button>
					<Button variant="primary" icon="plus" aria-disabled="true">Primary</Button>
					<Button variant="danger" icon="close" aria-disabled="true">Danger</Button>
					<Button variant="ghost" aria-disabled="true">Ghost</Button>
					<Button disabled>Disabled</Button>
				</div>
				<div class="inline">
					<SegmentedControl label="Demo">
						<button class:active={tab === 'one'} onclick={() => (tab = 'one')}>One</button>
						<button class:active={tab === 'two'} onclick={() => (tab = 'two')}>Two</button>
					</SegmentedControl>
					<SegmentedControl label="Chart range" options={ranges} bind:value={range} />
					<ModeSwitch bind:value={mode} liveEnabled />
					<ModeSwitch onliveunavailable={() => (liveHelp = true)} />
					<span class="muted">Dialog closed {liveHelpCloses} times</span>
				</div>
				<div class="inline">
					<Button onclick={() => (orderDetails = true)}>Long dialog</Button>
					<Button onclick={() => (updateToast = true)}>Show toast</Button>
					<Button onclick={() => (undoToast = true)}>Show undo toast</Button>
					<Button onclick={() => (drawerOpen = !drawerOpen)} aria-pressed={drawerOpen}>
						Tab bar More {drawerOpen ? 'open' : 'closed'}
					</Button>
					<Button onclick={() => (moreActive = !moreActive)} aria-pressed={moreActive}>
						Tab bar More {moreActive ? 'active' : 'inactive'}
					</Button>
					<Button onclick={() => (pillBar = !pillBar)} aria-pressed={pillBar}>
						Tab bar {pillBar ? 'pill' : 'bar'}
					</Button>
					<Button icon="search" onclick={() => pageSearch?.show()}>Page search</Button>
					<Button onclick={() => (searchCoins = !searchCoins)} aria-pressed={searchCoins}>
						Search {searchCoins ? 'pages and coins' : 'pages'}
					</Button>
				</div>
				<!-- Stands in for the drawer the More item controls. -->
				<p id="gallery-drawer" class="muted" hidden={!drawerOpen}>The drawer is open (pretend).</p>
				{#if archiving}
					<InlineConfirm
						question="Archive Momentum?"
						detail="It stops, cancels open orders and returns what it can to your account."
						confirmLabel="Archive"
						busyLabel="Archiving..."
						danger
						busy={archiveBusy}
						trigger={() => document.getElementById('archive-button')}
						onconfirm={archive}
						oncancel={() => (archiving = false)}
					/>
				{:else}
					<div class="inline">
						<Button id="archive-button" variant="danger" size="sm" icon="close" onclick={() => (archiving = true)}>
							Archive bot
						</Button>
						{#if archived}<span class="muted">Archived (pretend).</span>{/if}
					</div>
				{/if}
				<Alert>A neutral notice.</Alert>
				<Alert variant="warn">A warning.</Alert>
				<Alert variant="error">An error.</Alert>
				<Alert icon>A neutral notice with an icon.</Alert>
				<Alert variant="up" icon>Saved, with an icon.</Alert>
				<Alert variant="warn" icon>A warning with an icon.</Alert>
				<Alert variant="error" icon>
					An error with an icon, long enough to wrap onto a second line so the icon stays on the
					first.
				</Alert>
				<div class="inline">
					<Select aria-label="Demo select">
						<option>Inline select</option>
						<option>Another option</option>
					</Select>
					<Select aria-label="Disabled demo select" disabled>
						<option>Disabled</option>
					</Select>
				</div>
				<FormField label="Full width select">
					<Select style="width: 100%">
						<option>Fills its field</option>
					</Select>
				</FormField>
				<FormField label="Amount" error="Enter an amount above zero." errorId="demo-amount-error">
					<Input value="0" aria-invalid="true" aria-describedby="demo-amount-error" />
				</FormField>
				<div class="skeletons" aria-busy="true">
					<Skeleton width="60%" />
					<Skeleton width="40%" height="0.75rem" />
					<Skeleton width="2.5rem" height="2.5rem" radius="var(--radius-full)" />
				</div>
			</div>
		</Card>

		<Card title="Table" icon="orders" flush>
			<Table>
				<thead><tr><th>Token</th><th class="num">Amount</th><th class="num">Value</th></tr></thead>
				<tbody>
					<tr><td>USDC</td><td class="num">9,325</td><td class="num">$9,325.00</td></tr>
					<tr><td>JUP</td><td class="num">442.29</td><td class="num">$150.28</td></tr>
				</tbody>
			</Table>
			<Table rowHover={false}>
				<thead><tr><th>No row hover</th><th class="num">Value</th></tr></thead>
				<tbody>
					<tr><td>Not clickable</td><td class="num">$1.00</td></tr>
					<tr><td>Also not clickable</td><td class="num">$2.00</td></tr>
				</tbody>
			</Table>
			<div class="pagination-demo">
				<Pagination
					page={ordersPage}
					totalItems={340}
					perPage={25}
					onpage={loadOrdersPage}
					label="Orders pages"
					disabled={ordersLoading}
				/>
				<Pagination page={1} totalItems={12} perPage={25} label="One page" />
			</div>
			<EmptyState icon="bots" title="An empty state" text="With a line of explanation and an action.">
				<Button size="sm" variant="primary" icon="plus">Do the thing</Button>
			</EmptyState>
		</Card>
	</div>

	<div class="row">
		<Card title="Row list with actions" icon="watchlist" flush>
			<RowList label="Watchlist">
				{#each watched as entry (entry.symbol)}
					<RowItem href="#{entry.symbol}" value={entry.price} valueLabel="Price">
						<strong>{entry.name}</strong> <span class="muted">{entry.symbol}</span>
						{#snippet actions()}
							<Button
								size="sm"
								icon="close"
								aria-label="Remove {entry.symbol}"
								onclick={() => (watched = watched.filter((other) => other !== entry))}
							>
								Remove
							</Button>
						{/snippet}
					</RowItem>
				{/each}
				{#if watched.length === 0}
					<li class="muted empty">Nothing watched.</li>
				{/if}
			</RowList>
		</Card>

		<Card title="Two-line rows" icon="bots" flush>
			<RowList label="Bots">
				{#each bots as bot (bot.name)}
					<RowItem href="#{bot.name}" value={bot.value} valueLabel="Value" detail={bot.status} noteLabel="Return">
						<Icon name="bots" size={16} /> {bot.name}
						{#snippet note()}<span class={bot.tone}>{bot.change}</span>{/snippet}
					</RowItem>
				{/each}
				<RowItem>
					<Skeleton width="6rem" />
					{#snippet detail()}<Skeleton width="4rem" />{/snippet}
					{#snippet value()}<Skeleton width="4.5rem" />{/snippet}
					{#snippet note()}<Skeleton width="3rem" />{/snippet}
				</RowItem>
			</RowList>
		</Card>
	</div>

	{#if liveHelp}
		<Dialog
			title="Real money is off"
			onclose={() => {
				liveHelp = false;
				liveHelpCloses += 1;
			}}
		>
			<p class="dialog-text">What an app shows when Live is chosen but not enabled.</p>
			{#snippet footer()}
				<Button onclick={() => (liveHelp = false)}>Close</Button>
			{/snippet}
		</Dialog>
	{/if}

	<!-- A sheet on phones, long enough to scroll under its sticky heading. -->
	<Dialog bind:open={orderDetails} title="Order details" size="lg">
		{#each Array.from({ length: 12 }, (_, index) => index + 1) as line (line)}
			<p class="dialog-text">Line {line} of a long order summary, so the sheet scrolls on a phone.</p>
		{/each}
	</Dialog>

	<!-- Fixed over the page: bottom right, or centred above the TabBar on phones.
	     Dismissing one puts focus back on the button that showed it, or on main.
	     Two at once stack: the newer one at the anchor, the older pushed up. -->
	{#if updateToast}
		<Toast
			message="New version available."
			actionLabel="Reload"
			busyLabel="Reloading..."
			onaction={reload}
			actionBusy={reloading}
			dismissText="Later"
			ondismiss={() => (updateToast = false)}
		/>
	{/if}
	{#if undoToast}
		<Toast message="Removed Momentum." actionLabel="Undo" onaction={() => (undoToast = false)} ondismiss={() => (undoToast = false)} />
	{/if}

	<TabBar
		items={tabs}
		moreBadge={3}
		moreOpen={drawerOpen}
		{moreActive}
		moreControls="gallery-drawer"
		onmore={() => (drawerOpen = !drawerOpen)}
		variant={pillBar ? 'pill' : 'bar'}
		onsearch={() => pageSearch?.show()}
	/>
	<PageSearch
		bind:this={pageSearch}
		bind:open={pageSearchOpen}
		bind:query={pageSearchQuery}
		pages={searchPages}
		sections={searchCoins ? coinSections : undefined}
		pageLimit={searchCoins ? 3 : undefined}
	/>
</main>

<style>
	main {
		max-width: 64rem;
		margin: 0 auto;
		padding: var(--space-8) var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.stats,
	.row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--space-4);
	}

	.pagination-demo {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border-top: 1px solid var(--border);
	}

	.skeletons {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.tokens {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		gap: var(--space-4);
	}

	.scale {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.scale li {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: 1.5rem;
	}

	.scale code {
		margin-left: auto;
		font-size: var(--text-xs);
		color: var(--muted);
	}

	.space {
		display: inline-block;
		height: var(--space-4);
		background: var(--accent);
		border-radius: var(--radius-sm);
	}

	.icons {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
		gap: var(--space-2);
	}

	.icons li {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1-5);
		padding: var(--space-3) var(--space-1);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font-size: var(--text-2xs);
		color: var(--muted);
	}

	.icons li :global(.icon) {
		color: var(--fg);
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.dialog-text {
		margin: 0 0 var(--space-3);
		color: var(--muted);
		font-size: var(--text-sm);
	}

	/* Content clears the fixed TabBar on phones, PHONE_QUERY. */
	@media (max-width: 860px) and (pointer: coarse) {
		main {
			padding-bottom: calc(var(--space-8) + var(--tab-bar-height) + env(safe-area-inset-bottom));
		}
	}

	/* An element scrolled or focused into view stops clear of the toasts. */
	:global(html) {
		scroll-padding-bottom: calc(var(--space-4) + var(--toast-stack-height, 0));
	}

	.muted {
		color: var(--muted);
	}

	#gallery-drawer {
		margin: 0;
	}

	.empty {
		padding: var(--space-2-5) var(--space-4);
	}

	.up {
		color: var(--up);
	}

	.down {
		color: var(--down);
	}

	.inline {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}
</style>
