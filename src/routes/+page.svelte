<script lang="ts">
	import '../lib/tokens.css';
	import '../lib/globals.css';
	import Alert from '../lib/components/ui/Alert.svelte';
	import Badge from '../lib/components/ui/Badge.svelte';
	import Button from '../lib/components/ui/Button.svelte';
	import Card from '../lib/components/ui/Card.svelte';
	import FormField from '../lib/components/ui/FormField.svelte';
	import Grid from '../lib/components/ui/Grid.svelte';
	import Input from '../lib/components/ui/Input.svelte';
	import ModeSwitch from '../lib/components/ui/ModeSwitch.svelte';
	import PageHead from '../lib/components/ui/PageHead.svelte';
	import Pill from '../lib/components/ui/Pill.svelte';
	import SegmentedControl from '../lib/components/ui/SegmentedControl.svelte';
	import Separator from '../lib/components/ui/Separator.svelte';
	import Stat from '../lib/components/ui/Stat.svelte';
	import Table from '../lib/components/ui/Table.svelte';
	import Textarea from '../lib/components/ui/Textarea.svelte';
	import ThemeToggle from '../lib/components/ui/ThemeToggle.svelte';

	let tab = $state('buy');
	let mode = $state<'paper' | 'live'>('paper');
</script>

<div style="max-width: 56rem; margin: 0 auto; padding: 2rem 1rem;">
	<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
		<h1 style="margin: 0; font-size: 1.4rem;">solscope-ui components</h1>
		<ThemeToggle />
	</div>

	<h2>PageHead</h2>
	<PageHead title="Portfolio">
		{#snippet actions()}
			<ModeSwitch bind:value={mode} liveEnabled={false} />
			<Button variant="primary" size="sm">New order</Button>
		{/snippet}
	</PageHead>

	<Separator />

	<h2>Buttons</h2>
	<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
		<Button>Default</Button>
		<Button variant="primary">Primary</Button>
		<Button variant="danger">Danger</Button>
		<Button variant="ghost">Ghost</Button>
		<Button size="sm">Small</Button>
		<Button size="lg">Large</Button>
		<Button disabled>Disabled</Button>
	</div>

	<Separator />

	<h2>Badges and Pills</h2>
	<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
		<Badge>Default</Badge>
		<Badge variant="up">+12.4%</Badge>
		<Badge variant="down">-3.2%</Badge>
		<Badge variant="accent">Live</Badge>
		<Pill>paper</Pill>
		<Pill variant="live">live</Pill>
		<Pill variant="ok">filled</Pill>
	</div>

	<Separator />

	<h2>Cards and Grid</h2>
	<Grid>
		<Card>
			<div style="color: var(--muted); font-size: 0.82rem;">Account value</div>
			<div style="font-size: 1.9rem; font-weight: 700; margin: 0.25rem 0; font-variant-numeric: tabular-nums; letter-spacing: -0.03em;">$12,450.00</div>
			<div style="color: var(--muted); font-size: 0.82rem;">Cash available: $3,200.00</div>
		</Card>
		<Card>
			<div style="color: var(--muted); font-size: 0.82rem;">Bot: Dip Buyer</div>
			<div style="font-size: 1.9rem; font-weight: 700; margin: 0.25rem 0; font-variant-numeric: tabular-nums; letter-spacing: -0.03em;">$4,110.00</div>
			<div style="display: flex; gap: 0.5rem; align-items: center; font-size: 0.82rem;">
				<Pill variant="ok">running</Pill>
				<span style="color: var(--muted);">Super model</span>
			</div>
		</Card>
	</Grid>

	<Separator />

	<h2>Stats</h2>
	<dl style="display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
		<Stat label="Market cap" value="$48.2B" />
		<Stat label="24h volume" value="$2.1B" />
		<Stat label="24h high" value="$185.40" />
		<Stat label="24h low" value="$171.20" />
	</dl>

	<Separator />

	<h2>Segmented Control</h2>
	<div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
		<SegmentedControl label="Side">
			<button class:active={tab === 'buy'} onclick={() => (tab = 'buy')}>Buy</button>
			<button class:active={tab === 'sell'} onclick={() => (tab = 'sell')}>Sell</button>
		</SegmentedControl>
		<ModeSwitch bind:value={mode} liveEnabled={true} />
	</div>

	<Separator />

	<h2>Alerts</h2>
	<div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
		<Alert variant="default">Notice: Your paper mode order was placed.</Alert>
		<Alert variant="error">Error: Could not connect to the API.</Alert>
		<Alert variant="up">Success: Order filled at $184.20.</Alert>
	</div>

	<Separator />

	<h2>Form</h2>
	<Card>
		<FormField label="Amount (USD)" hint="Buys now at the best Jupiter price.">
			<Input type="text" placeholder="0.00" />
		</FormField>
		<FormField label="Strategy prompt">
			<Textarea rows={4} placeholder="Buy verified tokens that drop more than 10% in a day..." />
		</FormField>
		<FormField label="Model">
			<select style="font: inherit; font-size: 0.9rem; padding: 0.45rem 2rem 0.45rem 0.7rem; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg); color: var(--fg); width: 100%;">
				<option>Regular</option>
				<option>Super</option>
			</select>
		</FormField>
		<div style="display: flex; gap: 0.5rem;">
			<Button variant="primary">Place order</Button>
			<Button>Cancel</Button>
		</div>
	</Card>

	<Separator />

	<h2>Table</h2>
	<Card>
		<Table>
			<thead>
				<tr>
					<th>When</th>
					<th>Token</th>
					<th class="num">Amount</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td style="color: var(--muted);">2h ago</td>
					<td><a href="#" style="color: var(--accent);">SOL</a></td>
					<td class="num">$500.00</td>
					<td><Pill variant="ok">filled</Pill></td>
				</tr>
				<tr>
					<td style="color: var(--muted);">5h ago</td>
					<td><a href="#" style="color: var(--accent);">JTO</a></td>
					<td class="num">$200.00</td>
					<td><Pill>open</Pill></td>
				</tr>
			</tbody>
		</Table>
	</Card>
</div>
