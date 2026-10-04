<script lang="ts">
	import { inspectHint } from '../../../chart/series.js';

	// What a chart says while nothing is inspected: a pointer hovers or
	// drags, a finger can only drag. Both sentences render and CSS shows the
	// one for the screen, so it follows a hover-capable screen without script.
	let { noun, withMarkers = false }: { noun: string; withMarkers?: boolean } = $props();
</script>

<span class="hint pointer">{inspectHint(noun, withMarkers, false)}</span>
<span class="hint touch">{inspectHint(noun, withMarkers, true)}</span>

<style>
	.hint {
		color: var(--muted);
	}
	/* A finger cannot hover, so a touch screen reads the drag wording. */
	.hint.touch {
		display: none;
	}
	@media (hover: none) {
		.hint.pointer {
			display: none;
		}
		.hint.touch {
			display: inline;
		}
	}
</style>
