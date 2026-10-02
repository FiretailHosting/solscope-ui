<script lang="ts">
	import { chartThemeScopes, type ChartConfig, type ChartTheme } from './chart-utils.js';

	let { id, config }: { id: string; config: ChartConfig } = $props();

	const colorConfig = $derived(
		config ? Object.entries(config).filter(([, item]) => item.theme || item.color) : null
	);

	// One rule per theme scope, setting --color-<key> for every series.
	const themeContents = $derived.by(() => {
		if (!colorConfig || !colorConfig.length) return;

		const rules: string[] = [];
		for (const [theme, scopes] of Object.entries(chartThemeScopes)) {
			const declarations = colorConfig
				.map(([key, item]) => {
					const color = item.theme?.[theme as ChartTheme] || item.color;
					return color ? `\t--color-${key}: ${color};` : null;
				})
				.filter(Boolean)
				.join('\n');

			for (const scope of scopes) {
				const rule = `${scope.root} [data-chart=${id}] {\n${declarations}\n}`;
				rules.push(scope.media ? `@media ${scope.media} {\n${rule}\n}` : rule);
			}
		}

		return rules.join('\n');
	});
</script>

{#if themeContents}
	{#key id}
		<svelte:element this={'style'}>
			{themeContents}
		</svelte:element>
	{/key}
{/if}
