<script lang="ts">
	import Icon from './Icon.svelte';
	import { themeStorageKey, themes, type Theme } from '../../theme.js';

	let { class: extraClass = '' }: { class?: string } = $props();

	let theme = $state<Theme>('system');

	// Apply the saved choice on load, not only when it is changed.
	// themeInitScript in app.html has usually applied it already, before first paint.
	$effect(() => {
		try {
			const saved = localStorage.getItem(themeStorageKey);
			if (saved === 'light' || saved === 'dark') theme = saved;
		} catch {
			// Storage can be blocked; the system theme still applies.
		}
		applyTheme(theme);
	});

	function cycle() {
		theme = nextTheme(theme);
		try {
			localStorage.setItem(themeStorageKey, theme);
		} catch {
			// The choice just won't persist.
		}
		applyTheme(theme);
	}

	function nextTheme(current: Theme): Theme {
		return themes[(themes.indexOf(current) + 1) % themes.length];
	}

	function applyTheme(t: Theme) {
		const root = document.documentElement;
		if (t === 'system') root.removeAttribute('data-theme');
		else root.setAttribute('data-theme', t);
	}

	const labels: Record<Theme, string> = {
		system: 'Auto theme',
		light: 'Light theme',
		dark: 'Dark theme'
	};
</script>

<button
	class="sui-toggle {extraClass}"
	onclick={cycle}
	aria-label="{labels[theme]}. Switch to {labels[nextTheme(theme)].toLowerCase()}"
>
	<Icon name="theme" size={15} />
	<span>{labels[theme]}</span>
</button>

<style>
	.sui-toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		font: inherit;
		font-size: var(--text-xs);
		white-space: nowrap;
		padding: var(--space-1) var(--space-2-5);
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
