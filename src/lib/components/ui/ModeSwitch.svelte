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

<div class="switch" role="group" aria-label="Money">
	<button class:active={value === 'paper'} onclick={() => set('paper')}>Paper</button>
	<button
		class:active={value === 'live'}
		class="live-btn"
		onclick={() => set('live')}
		disabled={!liveEnabled}
		title={liveEnabled ? 'Real money' : 'Real money is not enabled for your account'}
	>
		Live
	</button>
</div>

<style>
	.switch {
		display: inline-flex;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		background: var(--card);
	}

	button {
		font: inherit;
		font-size: 0.8rem;
		padding: 0.3rem 0.85rem;
		border: 0;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		transition: background 120ms, color 120ms;
	}

	button + button {
		border-left: 1px solid var(--border);
	}

	button.active {
		background: var(--accent);
		color: #fff;
	}

	.live-btn.active {
		background: var(--down);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
