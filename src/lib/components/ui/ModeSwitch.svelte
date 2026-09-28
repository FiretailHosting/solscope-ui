<script lang="ts">
	type Mode = 'paper' | 'live';

	let {
		value = $bindable<Mode>('paper'),
		liveEnabled = false,
		onchange
	}: {
		value?: Mode;
		liveEnabled?: boolean;
		onchange?: (mode: Mode) => void;
	} = $props();

	function set(m: Mode) {
		value = m;
		onchange?.(m);
	}
</script>

<div class="sui-switch" role="group" aria-label="Money">
	<button class:active={value === 'paper'} aria-pressed={value === 'paper'} onclick={() => set('paper')}>
		Paper
	</button>
	<button
		class:active={value === 'live'}
		class="live-btn"
		aria-pressed={value === 'live'}
		onclick={() => set('live')}
		disabled={!liveEnabled}
		title={liveEnabled ? 'Real money' : 'Real money is not enabled for your account'}
	>
		Live
	</button>
</div>

<style>
	.sui-switch {
		display: inline-flex;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		overflow: hidden;
		background: var(--card);
	}

	button {
		font: inherit;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.3rem 0.8rem;
		border: 0;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
	}

	button + button {
		border-left: 1px solid var(--border-strong);
	}

	button:hover:not(:disabled):not(.active) {
		background: var(--card-alt);
		color: var(--fg);
	}

	button.active {
		background: var(--accent);
		color: var(--accent-fg);
	}

	.live-btn.active {
		background: var(--down);
		color: #fff;
	}

	button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	button:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}
</style>
