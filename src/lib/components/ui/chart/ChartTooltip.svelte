<script lang="ts">
	// Adapted from shadcn-svelte's chart (MIT, see LICENSE.txt in this folder).
	import { getChartContext, Tooltip as TooltipPrimitive } from 'layerchart';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getPayloadConfigFromPayload, useChart, type TooltipPayload } from './chart-utils.js';

	function defaultFormatter(value: unknown, _payload: TooltipPayload[]) {
		return `${value}`;
	}

	let {
		ref = $bindable(null),
		class: extraClass = '',
		hideLabel = false,
		indicator = 'dot',
		hideIndicator = false,
		labelKey,
		label,
		labelFormatter = defaultFormatter,
		labelClass = '',
		formatter,
		nameKey,
		color,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		ref?: HTMLDivElement | null;
		class?: string;
		hideLabel?: boolean;
		/** A series key from the config, or literal text, shown as the heading. */
		label?: string;
		indicator?: 'line' | 'dot' | 'dashed';
		/** The data field or config key that names each row. */
		nameKey?: string;
		/** The data field or config key used for the heading. */
		labelKey?: string;
		hideIndicator?: boolean;
		labelClass?: string;
		labelFormatter?: ((value: unknown, payload: TooltipPayload[]) => string | number | Snippet) | null;
		/** Draws each row yourself in place of the indicator, name and value. */
		formatter?: Snippet<
			[
				{
					value: unknown;
					name: string;
					item: TooltipPayload;
					index: number;
					payload: TooltipPayload[];
				}
			]
		>;
		/** Overrides every row's indicator colour. */
		color?: string;
	} = $props();

	const chart = useChart();
	const chartContext = getChartContext();

	// Only series with a value: Pie and Arc charts give the hovered item one.
	const visibleSeries = $derived(
		chartContext.tooltip.series.filter((series: TooltipPayload) => series.value !== undefined)
	);

	const formattedLabel = $derived.by(() => {
		if (hideLabel || !visibleSeries?.length) return null;

		const [item] = visibleSeries;
		const tooltipData = chartContext.tooltip.data;

		// The x value of the hovered data, such as a Date or a month name.
		const dataLabel = tooltipData != null ? chartContext.x(tooltipData) : undefined;

		const key = labelKey ?? item?.label ?? item?.key ?? 'value';
		const itemConfig = getPayloadConfigFromPayload(
			chart.config,
			item,
			key,
			tooltipData as Record<string, unknown> | null
		);

		let value: unknown;
		if (!labelKey && typeof label === 'string') {
			value = chart.config[label]?.label ?? label;
		} else if (labelKey) {
			value = itemConfig?.label ?? dataLabel;
		} else {
			value = dataLabel;
		}

		if (value === undefined) return null;
		if (!labelFormatter) return value;
		return labelFormatter(value, visibleSeries);
	});

	// A single line or dashed row puts the heading beside its indicator.
	const nestLabel = $derived(visibleSeries.length === 1 && indicator !== 'dot');
</script>

{#snippet tooltipLabel()}
	{#if formattedLabel}
		<div class="label {labelClass}">
			{#if typeof formattedLabel === 'function'}
				{@render (formattedLabel as Snippet)()}
			{:else}
				{formattedLabel}
			{/if}
		</div>
	{/if}
{/snippet}

<TooltipPrimitive.Root variant="none">
	<div bind:this={ref} class="sui-chart-tooltip {extraClass}" {...restProps}>
		{#if !nestLabel}
			{@render tooltipLabel()}
		{/if}
		<div class="rows">
			{#each visibleSeries as item, index (item.key + index)}
				{@const key = `${nameKey || item.key || item.label || 'value'}`}
				{@const itemConfig = getPayloadConfigFromPayload(
					chart.config,
					item,
					key,
					chartContext.tooltip.data
				)}
				{@const indicatorColor = color || item.config?.color || item.color}
				<div class="row" class:dot={indicator === 'dot'}>
					{#if formatter && item.value !== undefined && item.label}
						{@render formatter({
							value: item.value,
							name: item.label,
							item,
							index,
							payload: visibleSeries
						})}
					{:else}
						{#if itemConfig?.icon}
							<itemConfig.icon />
						{:else if !hideIndicator}
							<div
								class="indicator {indicator}"
								class:nested={nestLabel}
								style:--indicator-color={indicatorColor}
							></div>
						{/if}
						<div class="entry" class:nested={nestLabel}>
							<div class="names">
								{#if nestLabel}
									{@render tooltipLabel()}
								{/if}
								<span class="name">{itemConfig?.label || item.label}</span>
							</div>
							{#if item.value !== undefined}
								<span class="value">{item.value.toLocaleString()}</span>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</TooltipPrimitive.Root>

<style>
	.sui-chart-tooltip {
		display: grid;
		align-items: start;
		gap: 0.375rem;
		min-width: 8rem;
		padding: 0.375rem 0.625rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		color: var(--fg);
		font-size: 0.75rem;
	}

	.label {
		font-weight: 500;
	}

	.rows,
	.names {
		display: grid;
		gap: 0.375rem;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: stretch;
		gap: 0.5rem;
		width: 100%;
	}

	.row.dot {
		align-items: center;
	}

	.row > :global(svg) {
		width: 0.625rem;
		height: 0.625rem;
		color: var(--muted);
	}

	.indicator {
		flex-shrink: 0;
		background: var(--indicator-color);
		border: 0 solid var(--indicator-color);
		border-radius: 2px;
	}

	.indicator.dot {
		width: 0.625rem;
		height: 0.625rem;
	}

	.indicator.line {
		width: 0.25rem;
	}

	.indicator.dashed {
		width: 0;
		background: transparent;
		border-width: 1.5px;
		border-style: dashed;
	}

	.indicator.dashed.nested {
		margin: 0.125rem 0;
	}

	.entry {
		display: flex;
		flex: 1;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		line-height: 1;
	}

	.entry.nested {
		align-items: flex-end;
	}

	.name {
		color: var(--muted);
	}

	.value {
		font-family: var(--font-mono);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		color: var(--fg);
	}
</style>
