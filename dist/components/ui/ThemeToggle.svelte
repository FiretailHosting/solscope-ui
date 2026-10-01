<script lang="ts">
	import Icon from './Icon.svelte';

	type Theme = 'system' | 'light' | 'dark';

	let { class: extraClass = '' }: { class?: string } = $props();

	let theme = $state<Theme>('system');

	// Apply the saved choice on load, not only when it is changed.
	$effect(() => {
		try {
			const saved = localStorage.getItem('theme');
			if (saved === 'light' || saved === 'dark') theme = saved;
		} catch {
			// Storage can be blocked; the system theme still applies.
		}
		applyTheme(theme);
	});

	function cycle() {
		const order: Theme[] = ['system', 'light', 'dark'];
		theme = order[(order.indexOf(theme) + 1) % order.length];
		try {
			localStorage.setItem('theme', theme);
		} catch {
			// The choice just won't persist.
		}
		applyTheme(theme);
	}

	function applyTheme(t: Theme) {
		const root = document.documentElement;
		if (t === 'system') root.removeAttribute('data-theme');
		else root.setAttribute('data-theme', t);
	}

	const labels: Record<Theme, string> = {
		system: 'Auto',
		light: 'Light',
		dark: 'Dark'
	};
</script>

<button class="sui-toggle {extraClass}" onclick={cycle} aria-label="Theme: {labels[theme]}. Change theme">
	<Icon name="theme" size={15} />
	<span>{labels[theme]}</span>
</button>

<style>
	.sui-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font: inherit;
		font-size: 0.78rem;
		padding: 0.3rem 0.6rem;
		border-radius: var(--radius);
		border: 1px solid currentColor;
		background: transparent;
		color: inherit;
		opacity: 0.85;
		cursor: pointer;
	}

	.sui-toggle:hover {
		opacity: 1;
	}

	.sui-toggle:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	/* Easier to tap on touch screens; desktop sizes stay as they are. */
	@media (pointer: coarse) {
		.sui-toggle {
			min-height: 44px;
		}
	}
</style>
