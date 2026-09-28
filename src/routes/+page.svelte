<script lang="ts">
	import {
		Alert,
		Badge,
		Button,
		Card,
		EmptyState,
		Icon,
		icons,
		ModeSwitch,
		PageHead,
		Pill,
		SegmentedControl,
		Stat,
		Table,
		ThemeToggle,
		type IconName
	} from '$lib';

	// A gallery of the library, for checking changes by eye: `bun run dev`.
	const names = Object.keys(icons) as IconName[];
	let tab = $state('one');
	let mode = $state<'paper' | 'live'>('paper');
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
					<SegmentedControl label="Demo">
						<button class:active={tab === 'one'} onclick={() => (tab = 'one')}>One</button>
						<button class:active={tab === 'two'} onclick={() => (tab = 'two')}>Two</button>
					</SegmentedControl>
					<ModeSwitch bind:value={mode} liveEnabled />
				</div>
				<Alert>A neutral notice.</Alert>
				<Alert variant="warn">A warning.</Alert>
				<Alert variant="error">An error.</Alert>
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
			<EmptyState icon="bots" title="An empty state" text="With a line of explanation and an action.">
				<Button size="sm" variant="primary" icon="plus">Do the thing</Button>
			</EmptyState>
		</Card>
	</div>
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

	.inline {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}
</style>
