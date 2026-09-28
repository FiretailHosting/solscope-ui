<script lang="ts">
	let {
		label = '',
		value = '',
		class: extraClass = ''
	}: {
		label: string;
		value: string;
		class?: string;
	} = $props();
</script>

<div class="stat {extraClass}">
	<dt>{label}</dt>
	<dd>{value}</dd>
</div>

<style>
	.stat {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 0.75rem 0.9rem;
	}

	dt {
		color: var(--muted);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 500;
	}

	dd {
		margin: 0.3rem 0 0;
		font-variant-numeric: tabular-nums;
		font-size: 1.05rem;
		font-weight: 500;
	}
</style>
