<script lang="ts">
	import {
		Alert,
		Badge,
		Button,
		Card,
		ChartContainer,
		ChartTooltip,
		EmptyState,
		FormField,
		Icon,
		icons,
		ModeSwitch,
		PageHead,
		Pill,
		SegmentedControl,
		Select,
		Skeleton,
		Stat,
		Table,
		ThemeToggle,
		type ChartConfig,
		type IconName,
		type SegmentedOption
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
	let liveHelp: HTMLDialogElement;
	let saving = $state(false);

	function startSaving() {
		saving = true;
		setTimeout(() => (saving = false), 2000);
	}
</script>

<main>
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
					<Button variant="primary" icon="plus" loading>Placing order</Button>
					<Button loading>Save</Button>
					<Button size="sm" loading>Small</Button>
					<Button variant="primary" onclick={startSaving} loading={saving}>Save changes</Button>
				</div>
				<div class="inline">
					<SegmentedControl label="Demo">
						<button class:active={tab === 'one'} onclick={() => (tab = 'one')}>One</button>
						<button class:active={tab === 'two'} onclick={() => (tab = 'two')}>Two</button>
					</SegmentedControl>
					<SegmentedControl label="Chart range" options={ranges} bind:value={range} />
					<ModeSwitch bind:value={mode} liveEnabled />
					<ModeSwitch onliveunavailable={() => liveHelp.showModal()} />
				</div>
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
			<EmptyState icon="bots" title="An empty state" text="With a line of explanation and an action.">
				<Button size="sm" variant="primary" icon="plus">Do the thing</Button>
			</EmptyState>
		</Card>
	</div>

	<dialog bind:this={liveHelp} aria-labelledby="live-help-title">
		<h2 id="live-help-title">Real money is off</h2>
		<p>What an app shows when Live is chosen but not enabled.</p>
		<Button onclick={() => liveHelp.close()}>Close</Button>
	</dialog>
</main>

<style>
	main {
		max-width: 64rem;
		margin: 0 auto;
		padding: 2rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.stats,
	.row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 1rem;
	}

	.skeletons {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.icons {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
		gap: 0.5rem;
	}

	.icons li {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		padding: 0.75rem 0.25rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font-size: 0.72rem;
		color: var(--muted);
	}

	.icons li :global(.icon) {
		color: var(--fg);
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	dialog {
		max-width: 24rem;
		padding: 1.25rem;
		color: var(--fg);
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	dialog h2 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
	}

	dialog p {
		margin: 0 0 1rem;
		color: var(--muted);
		font-size: 0.875rem;
	}

	.inline {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}
</style>
