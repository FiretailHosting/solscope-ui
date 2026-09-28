<script lang="ts">
	type Theme = 'system' | 'light' | 'dark';

	let { class: extraClass = '' }: { class?: string } = $props();

	let theme = $state<Theme>('system');

	$effect(() => {
		const saved = localStorage.getItem('theme') as Theme | null;
		if (saved) theme = saved;
	});

	function cycle() {
		const order: Theme[] = ['system', 'light', 'dark'];
		theme = order[(order.indexOf(theme) + 1) % order.length];
		localStorage.setItem('theme', theme);
		applyTheme(theme);
	}

	function applyTheme(t: Theme) {
		const root = document.documentElement;
		if (t === 'dark') {
			root.setAttribute('data-theme', 'dark');
		} else if (t === 'light') {
			root.setAttribute('data-theme', 'light');
		} else {
			root.removeAttribute('data-theme');
		}
	}

	const labels: Record<Theme, string> = {
		system: 'Auto',
		light: 'Light',
		dark: 'Dark'
	};
</script>

<button class="toggle {extraClass}" onclick={cycle} title="Toggle theme" aria-label="Toggle theme: {labels[theme]}">
	{labels[theme]}
</button>

<style>
	.toggle {
		font: inherit;
		font-size: 0.78rem;
		padding: 0.3rem 0.65rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--card);
		color: var(--muted);
		cursor: pointer;
		transition: border-color 120ms, color 120ms;
	}

	.toggle:hover {
		border-color: var(--accent);
		color: var(--fg);
	}
</style>
