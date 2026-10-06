<script lang="ts">
	import type { ChartState } from 'layerchart';
	import { tick, untrack, type Component } from 'svelte';
	import { forgetAvatarWaiter, loadAvatar, avatarStatus, settleAvatar } from '../../../chart/avatars.js';
	import {
		boundsWithLevels,
		layoutLevelTags,
		levelGroupText,
		levelsInRange,
		levelsSummary,
		placeLevels,
		type LevelEdge,
		type SeriesLevel
	} from '../../../chart/levels.js';
	import { axisTime, chartDay, chartTime, spansYears } from '../../../chart/dates.js';
	import {
		clusterKey,
		clusterLabel,
		clusterMarkers,
		clusterSide,
		MARKER_CLUSTER_DISTANCE,
		MARKER_CLUSTER_DISTANCE_COARSE,
		markerFace,
		type MarkerCluster,
		type PlacedMarker
	} from '../../../chart/markers.js';
	import {
		boundsWithMarkers,
		candleReading,
		carriedIndex,
		guideLabels,
		guideValues,
		hasCandles,
		inGap,
		isCandle,
		lonePoints,
		markerKey,
		markersInRange,
		markersInTime,
		nearestIndex,
		plotPoints,
		seriesPlotStyle,
		seriesSummary,
		timeTicks,
		valueBounds,
		xAtTime,
		type PlottedPoint,
		type SeriesMarker,
		type SeriesPoint
	} from '../../../chart/series.js';
	import ChartHint from './ChartHint.svelte';
	import SeriesHintRow from './SeriesHintRow.svelte';

	// A price or value over time, drawn by LayerChart in SVG, and inspected
	// by pointer, finger, keyboard and screen reader alike. The SVG only
	// paints the line, area or candles; everything a person reads or reaches
	// is DOM laid over it with the chart's own scales: the guides and time
	// labels, the price levels, the crosshair, a tooltip for a mouse, the
	// readout under the chart for touch and screen readers, a hidden range
	// slider for the keyboard, and the trade markers as real buttons. Escape
	// hides the tooltip.

	const uid = $props.id();

	let {
		points = [],
		kind = 'line',
		height = 260,
		markers = [],
		markersPossible = false,
		levels = [],
		label = 'Price history',
		noun = 'price',
		hint,
		empty = 'Not enough history to draw a chart.',
		failed = 'Could not load the chart.',
		onfailed,
		summary,
		byTime = false,
		gap = 0,
		fixed = false,
		minHeight,
		baseline = false,
		guides = true,
		timeAxis = true,
		live = false,
		animate = true,
		format = (n: number) => n.toLocaleString(),
		axisFormat,
		formatTime = chartTime,
		formatDay = chartDay,
		change,
		class: extraClass = ''
	}: {
		points: SeriesPoint[];
		/** Candles need every point to carry o, h and l; otherwise a line is drawn. */
		kind?: 'line' | 'candles';
		height?: number;
		/** Trades on the chart; each may carry the trader's `avatar` picture and `name`. */
		markers?: SeriesMarker[];
		/** Markers may show on this chart, now or later: the hint row keeps the room of the hint with markers, so it does not move when they come or go. */
		markersPossible?: boolean;
		/** Prices marked across the plot, such as an open order or a take profit, each with its label and value at the right edge; updated in place by key. */
		levels?: SeriesLevel[];
		label?: string;
		/** What a point is, for the default hint: "price", "market cap". */
		noun?: string;
		/** Text under the chart while nothing is inspected; by default, how to inspect. */
		hint?: string;
		/** Shown in place of the chart when there are fewer than two points. */
		empty?: string;
		/** Shown in place of the plot when its code fails to load, as offline; the readout row keeps its space. */
		failed?: string;
		/** Called once when the plot's code fails to load. */
		onfailed?: () => void;
		/** The chart's description for screen readers; by default its span, start, end, high and low. The levels are read after it. */
		summary?: string;
		/** Place points by their time rather than evenly, so gaps show. */
		byTime?: boolean;
		/** With byTime, break the line where points are further apart than this, in ms. */
		gap?: number;
		/** Keep height in pixels at any width, rather than scaling with it. */
		fixed?: boolean;
		/** Without `fixed`, the plot's least height in pixels, so a narrow card still gets a readable plot; by default seriesMinHeight(height): 220, or `height` when less. */
		minHeight?: number;
		/** Draw a zero line, keep it in view and fill toward it: above it reads as gain, below as loss. */
		baseline?: boolean;
		/** Faint horizontal lines at round values, labelled at the left edge. */
		guides?: boolean;
		/** Times along the bottom edge. */
		timeAxis?: boolean;
		/** The last point is now: its dot pulses. */
		live?: boolean;
		/** Reveal the chart from left to right when a new series arrives; off under reduced motion anyway. */
		animate?: boolean;
		/** How a value reads when inspected. */
		format?: (n: number) => string;
		/** How a value reads on the plot's own labels: the guides, zero and the inspected level. `format` by default, so a shorter one keeps them apart on a phone. */
		axisFormat?: (n: number) => string;
		/** How a moment reads: "Sep 25, 5:21 AM". */
		formatTime?: (t: number, withYear: boolean) => string;
		/** How a day reads: "Sep 24". */
		formatDay?: (t: number, withYear: boolean) => string;
		/** With this, an inspected point also shows its change from the first point, as this formats it. */
		change?: (difference: number) => string;
		class?: string;
	} = $props();

	// Space above and below the line, so its peaks and troughs are not cut off.
	const PAD = 8;
	// The height of the row of times along the bottom, which guide labels keep out of.
	const TICK_ROW = 16;
	// The most trades a picked group lists before the list scrolls.
	const LIST_ROWS = 4;
	// A level's label, in pixels, and the space kept between two stacked labels.
	const LEVEL_LABEL = 16;
	const LEVEL_LABEL_GAP = 2;
	const LEVEL_SLOT = LEVEL_LABEL + LEVEL_LABEL_GAP;

	const formatAxis = $derived(axisFormat ?? format);
	const candles = $derived(kind === 'candles' && hasCandles(points));
	const plotted = $derived(plotPoints(points, byTime, gap));
	// Runs of one point, which a line alone would not show, by their index.
	const lone = $derived.by(() => {
		if (candles) return [];
		const single = new Set(lonePoints(plotted));
		return plotted.flatMap((point, index) => (single.has(point) ? [index] : []));
	});
	const bounds = $derived(valueBounds(plotted, baseline, candles));
	// The markers drawn: in the points' time and near their prices. The view
	// fits them too, so a fill just outside the prices sits at its true price
	// inside the plot, never over the time axis or under the plot.
	const markersShown = $derived(markersInRange(markersInTime(points, markers), bounds));
	// Levels a little outside the prices widen the view the same way; a far
	// one pins to the top or bottom edge instead, so it never flattens the
	// series.
	const fittedBounds = $derived(bounds ? boundsWithLevels(boundsWithMarkers(bounds, markersShown), levelsInRange(levels, bounds)) : null);
	const placedLevels = $derived(fittedBounds ? placeLevels(levels, fittedBounds) : []);
	const yDomain = $derived<[number, number]>(fittedBounds ? [fittedBounds.min, fittedBounds.min + fittedBounds.span] : [0, 1]);
	const withYear = $derived(spansYears(points));
	const spanMs = $derived(points.length > 1 ? points[points.length - 1].t - points[0].t : 0);
	const description = $derived(
		[summary ?? seriesSummary(points, candles, format, formatTime, withYear), levelsSummary(placedLevels, format)].filter(Boolean).join(' ')
	);

	// Green when the range ends higher than it started, red when lower. The
	// line, its fill and the end dot all take this one colour.
	const up = $derived(points.length > 1 ? points[points.length - 1].p >= points[0].p : true);
	const lineColor = $derived(up ? 'var(--up)' : 'var(--down)');
	// The plot scales with its width but is never shorter than its least
	// height, so a chart in a narrow card stays readable; a stand-in for it
	// takes the same style, seriesPlotStyle, so nothing moves. The height
	// follows the width of the size container around the plot, and never
	// the other way: an aspect ratio with a least height would give the
	// plot a least width too, wider than a narrow card.
	const sizing = $derived(seriesPlotStyle(height, { fixed, minHeight }));

	// The picture, drawn by LayerChart. It is loaded in the browser once the
	// plot is on the page, from a chunk of its own, so pages without a chart
	// and server rendering never load it. Its scales follow every resize and
	// new series, and what is laid over it is placed with them.
	let host = $state<HTMLElement>();
	let plotElement = $state<HTMLElement>();
	let overlay = $state<HTMLElement>();
	let Plot = $state<Component<any> | null>(null);
	let context = $state<ChartState<PlottedPoint>>();
	// A chunk that fails to load, as offline, shows the failed text in the
	// plot's place, at the plot's size and with the readout row's space kept,
	// so nothing below moves.
	let plotFailed = $state(false);
	const ready = $derived(Plot != null && context != null && context.isMeasured && context.width > 0 && context.height > 0);
	const plotWidth = $derived(context?.width ?? 0);
	const plotHeight = $derived(context?.height ?? 0);

	$effect(() => {
		if (!host || Plot) return;
		let disposed = false;
		import('./SeriesPlot.svelte').then(
			(module) => {
				if (!disposed) Plot = module.default;
			},
			() => {
				if (disposed) return;
				plotFailed = true;
				onfailed?.();
			}
		);
		return () => {
			disposed = true;
		};
	});

	/** xAt is the left of a value along the x axis, a time or an index as plotPoints placed it, in pixels. */
	function xAt(x: number): number {
		return context ? context.xScale(x) : 0;
	}

	/** yAt is the top of a value on the plot, in pixels. */
	function yAt(value: number): number {
		return context ? context.yScale(value) : 0;
	}

	/** pointLeft is where the plotted point at this index sits across the plot. */
	function pointLeft(index: number): number {
		return xAt(plotted[index]?.x ?? 0);
	}

	// A finger needs markers further apart before they group.
	let coarse = $state(false);
	$effect(() => {
		const query = window.matchMedia('(pointer: coarse)');
		const update = () => (coarse = query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	// A new series, another range or kind, wipes in from the left; a live
	// tick, which keeps the first point, does not.
	let revealedKey = '';
	const revealKey = $derived(`${candles ? 'candles' : baseline ? 'baseline' : 'area'}|${plotted[0]?.t}`);
	$effect(() => {
		const key = revealKey;
		if (!ready) return;
		untrack(() => reveal(key));
	});

	/** reveal wipes a new series in from the left; a live tick on the same series does not. Nothing moves under reduced motion. */
	function reveal(key: string) {
		if (key === revealedKey) return;
		revealedKey = key;
		if (!animate || !host || typeof host.animate !== 'function') return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		host.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], {
			duration: candles ? 600 : 900,
			easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
		});
	}

	// What is being inspected. The pointer, the keyboard slider and the trade
	// markers all set it, and the tooltip, crosshair and readout follow it.
	let inspectedIndex = $state<number | null>(null);
	let pointerInGap = $state(false);
	// A group of trades under the pointer or focus, and one picked by a press.
	let hoveredGroup = $state<SeriesMarker[] | null>(null);
	let pickedGroup = $state<SeriesMarker[] | null>(null);
	// A finger covers a floating tooltip, so touch inspects through the
	// readout alone, and it stays after the finger lifts.
	let touching = $state(false);
	// Escape hides the tooltip until the next inspection (WCAG 1.4.13).
	let tooltipDismissed = $state(false);
	// The readout speaks only in the update that changes the pick, so a
	// picked group shown again on blur is not read out a second time.
	let pickChanged = $state(false);

	const inspected = $derived(inspectedIndex == null ? null : (plotted[inspectedIndex] ?? null));
	// A marker under the pointer or focus comes first, then an inspected
	// point, so inspecting after a pick shows the point, and then the pick.
	const shownGroup = $derived(hoveredGroup ?? (inspected ? null : pickedGroup));
	// A picked group lists its trades under the readout until a point is inspected.
	const listShown = $derived(!inspected && pickedGroup != null && pickedGroup.length > 1);
	const pickedKey = $derived(pickedGroup ? clusterKey(pickedGroup) : null);

	// New points keep what is inspected on the same moment, so a live tick
	// does not throw away a keyboard or touch inspection. When that moment is
	// gone, as when another range arrives, the inspection ends.
	let previousPlotted: PlottedPoint[] = [];
	$effect.pre(() => {
		const next = plotted;
		untrack(() => {
			inspectedIndex = carriedIndex(previousPlotted, next, inspectedIndex);
			if (inspectedIndex == null) pointerInGap = false;
			previousPlotted = next;
		});
	});

	// New markers, from another range or view, leave nothing picked.
	const markerKeys = $derived(markers.map(markerKey).join('\n'));
	$effect.pre(() => {
		void markerKeys;
		untrack(() => {
			pickedGroup = null;
			hoveredGroup = null;
			pickChanged = false;
		});
	});

	// The markers in pixels, grouped where they would cover each other.
	const clusters = $derived.by((): MarkerCluster<PlacedMarker>[] => {
		if (!ready || plotHeight <= 0) return [];
		const placed: PlacedMarker[] = [];
		for (const marker of markersShown) {
			placed.push({ ...marker, left: xAt(xAtTime(plotted, marker.t)), top: yAt(marker.price) });
		}
		return clusterMarkers(placed, coarse ? MARKER_CLUSTER_DISTANCE_COARSE : MARKER_CLUSTER_DISTANCE);
	});

	// Traders' pictures load once the chart is near the screen, only for the
	// markers drawn, once per page; until then, and if one fails, the
	// marker shows initials or the buy or sell shape in the same circle.
	let nearScreen = $state(false);
	let avatarVersion = $state(0);
	const avatarSettled = () => avatarVersion++;
	$effect(() => {
		if (!plotElement) return;
		if (typeof IntersectionObserver === 'undefined') {
			nearScreen = true;
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					nearScreen = true;
					observer.disconnect();
				}
			},
			{ rootMargin: '200px' }
		);
		observer.observe(plotElement);
		return () => observer.disconnect();
	});
	$effect(() => {
		if (!nearScreen) return;
		for (const cluster of clusters) {
			const url = cluster.members[0].avatar;
			if (url) untrack(() => loadAvatar(url, avatarSettled));
		}
	});
	$effect(() => () => forgetAvatarWaiter(avatarSettled));

	// The trade whose marker has focus. A live trade, a resize or a rotation
	// can merge or split groups, which replaces the focused button; focus
	// then moves to the button whose group holds that trade (WCAG 2.4.3).
	let focusedTrade: string | null = null;
	let markersLayer = $state<HTMLElement>();
	$effect(() => {
		void clusters;
		untrack(() => {
			if (!focusedTrade || !markersLayer) return;
			const trade = focusedTrade;
			tick().then(() => {
				const active = document.activeElement;
				if (active && active !== document.body) return;
				const button = [...(markersLayer?.querySelectorAll<HTMLElement>('.marker') ?? [])].find((candidate) =>
					(candidate.dataset.trades ?? '').split('\n').includes(trade)
				);
				button?.focus();
			});
		});
	});

	function faceOf(marker: SeriesMarker) {
		void avatarVersion;
		return markerFace(marker, marker.avatar ? avatarStatus(marker.avatar) : undefined);
	}

	function avatarFailed(url: string) {
		settleAvatar(url, 'failed');
		avatarVersion++;
	}

	// The tooltip shows an inspected point, unless a finger is down or Escape
	// hid it. A marker has none: the readout shows its trade, and a tooltip
	// the pointer cannot move onto would fail WCAG 1.4.13.
	const tooltipShown = $derived(!touching && !tooltipDismissed && inspected != null && !pointerInGap);
	const tooltipLeft = $derived(inspectedIndex == null ? 0 : pointLeft(inspectedIndex));

	/** inspectAt finds the point under a pointer at this many pixels from the left of the plot. */
	function inspectAt(left: number) {
		if (!context || plotted.length === 0) return;
		const x = context.xScale.invert?.(left);
		if (x == null || !Number.isFinite(x)) return;
		const index = nearestIndex(plotted, x);
		inspectedIndex = index;
		pointerInGap = inGap(plotted[index], x, byTime, gap);
		tooltipDismissed = false;
		pickChanged = false;
	}

	function onPlotPointer(event: PointerEvent) {
		const target = event.target as Element;
		if (!overlay || target.closest('.marker, .scrub, .level-chip')) return;
		touching = event.pointerType === 'touch';
		inspectAt(event.clientX - overlay.getBoundingClientRect().left);
	}

	/** A marker under the pointer or focus takes over from any inspected point. */
	function showGroup(members: SeriesMarker[]) {
		inspectedIndex = null;
		pointerInGap = false;
		tooltipDismissed = false;
		pickChanged = false;
		hoveredGroup = members;
	}

	function togglePick(members: SeriesMarker[]) {
		pickedGroup = pickedKey === clusterKey(members) ? null : members;
		openEdge = null;
		// A press shows the pick in full, the list of a group's trades with it.
		hoveredGroup = null;
		pickChanged = true;
	}

	/** leaveGroup ends a marker's hover or focus; the pick, if any, shows again, silently. */
	function leaveGroup() {
		hoveredGroup = null;
		pickChanged = false;
	}

	function stopInspecting() {
		inspectedIndex = null;
		pointerInGap = false;
		touching = false;
		pickChanged = false;
	}

	// A touch inspection stays until the next tap outside the chart or a scroll.
	$effect(() => {
		if (!touching) return;
		const tapOutside = (event: PointerEvent) => {
			if (plotElement && !plotElement.contains(event.target as Node)) stopInspecting();
		};
		window.addEventListener('pointerdown', tapOutside, true);
		window.addEventListener('scroll', stopInspecting, { capture: true, passive: true });
		return () => {
			window.removeEventListener('pointerdown', tapOutside, true);
			window.removeEventListener('scroll', stopInspecting, true);
		};
	});

	function onWindowKey(event: KeyboardEvent) {
		if (event.key === 'Escape' && inspected) tooltipDismissed = true;
	}

	// Keyboard inspection: a visually hidden range input that moves the same
	// cursor as the pointer.
	const sliderIndex = $derived(inspectedIndex ?? plotted.length - 1);
	const sliderPoint = $derived(plotted[Math.min(sliderIndex, plotted.length - 1)]);

	function inspectIndex(index: number) {
		inspectedIndex = index;
		pointerInGap = false;
		touching = false;
		tooltipDismissed = false;
		pickChanged = false;
	}

	const withMarkers = $derived(markersShown.length > 0);
	/** changeSince is a point's change from the first, "+$12.40 since Sep 24", when the caller asked for it. */
	function changeSince(point: PlottedPoint | null) {
		if (!change || !point || plotted.length === 0) return null;
		return { text: `${change(point.p - plotted[0].p)} since ${formatDay(plotted[0].t, withYear)}`, up: point.p >= plotted[0].p };
	}
	const changeText = $derived(changeSince(inspected));

	/** candleText reads a candle's open, high and low, for the readout. */
	function candleText(point: SeriesPoint) {
		return isCandle(point) ? `open ${format(point.o)}, high ${format(point.h)}, low ${format(point.l)}` : '';
	}

	// A candle reads open, high, low and close, each named; a line point reads its value.
	const sliderText = $derived.by(() => {
		if (!sliderPoint) return undefined;
		const since = changeSince(sliderPoint);
		const value = candles && isCandle(sliderPoint) ? candleReading(sliderPoint, format) : format(sliderPoint.p);
		return `${value}, ${formatTime(sliderPoint.t, withYear)}${since ? `, ${since.text}` : ''}`;
	});

	/** groupSpan is when a group's trades ran: "Sep 25, 5:21 AM to Sep 25, 6:40 AM". */
	function groupSpan(members: SeriesMarker[]) {
		const first = formatTime(members[0].t, withYear);
		const last = formatTime(members[members.length - 1].t, withYear);
		return first === last ? first : `${first} to ${last}`;
	}

	// The slider and a focused marker announce themselves, and a pointer
	// scrubbing would announce every point, so the readout is live only in
	// the update that changes the pick, which a group's button cannot say
	// itself. The hint shown while nothing is inspected sits outside the
	// live part, so a caller's hint that changes with every live tick is
	// never read out (WCAG 2.2.2).
	const readoutLive = $derived(pickChanged);
	const pickedListId = `${uid}-picked`;

	// The guides and their labels, and the times along the bottom.
	const guideLines = $derived(guides && fittedBounds ? guideValues(fittedBounds.min, fittedBounds.span).filter((value) => !(baseline && value === 0)) : []);
	// A tick that would repeat the label before it, as two days can in a
	// 48-hour range, is left out.
	const tickLabels = $derived(
		(timeAxis ? timeTicks(plotted) : [])
			.map((tick) => ({ ...tick, index: plotted.indexOf(tick), label: axisTime(tick.t, spanMs, withYear) }))
			.filter((tick, index, all) => index === 0 || tick.label !== all[index - 1].label)
	);
	const lastIndex = $derived(plotted.length - 1);
	const last = $derived(plotted[lastIndex]);
	const active = $derived(inspected && !pointerInGap ? inspected : null);

	// Each level tag's width, so a tag over the line's live end dot can fade
	// and let the latest price show through.
	let levelTagWidths = $state<number[]>([]);
	const END_DOT_REACH = 6;
	function coversEnd(index: number): boolean {
		if (!ready || candles || !last || active) return false;
		const top = levelLabelTops[index];
		const width = levelTagWidths[index] ?? 0;
		if (top == null || width === 0) return false;
		const x = pointLeft(lastIndex);
		const y = yAt(last.p);
		return x >= plotWidth - width - END_DOT_REACH && y >= top - END_DOT_REACH && y <= top + LEVEL_LABEL + END_DOT_REACH;
	}

	/** The guides that get a label: none in the time axis's row, and one at most on a short chart. */
	const labelledGuides = $derived.by(() => {
		if (!ready) return [];
		const placed = guideLines.map((value) => ({ value, y: yAt(value) }));
		return guideLabels(placed, plotHeight, tickLabels.length > 0 ? TICK_ROW : 0);
	});

	// The levels' tags at the right edge, each just above its line, moved
	// apart so none covers another and kept out of the time axis's row. The
	// levels pinned beyond an edge gather into one chip at that edge, and so
	// do the outermost tags when there is no room for them all, so no tag
	// stacks over the series or leaves the plot.
	const levelLayout = $derived.by(() => {
		if (!ready || placedLevels.length === 0) return null;
		const bottom = plotHeight - (tickLabels.length > 0 ? TICK_ROW : 0);
		const wanted = placedLevels.map((level) => ({ wanted: level.pinned ? 0 : yAt(level.value) - LEVEL_LABEL / 2 - 1, value: level.value, pinned: level.pinned }));
		return layoutLevelTags(wanted, LEVEL_SLOT, 0, bottom);
	});
	const levelLabelTops = $derived(levelLayout ? levelLayout.tags.map((centre) => (centre == null ? null : centre - LEVEL_LABEL / 2)) : []);
	const levelGroups = $derived.by(() => {
		const layout = levelLayout;
		if (!layout) return [];
		return (['above', 'below'] as const).flatMap((edge) => {
			const centre = edge === 'above' ? layout.aboveChip : layout.belowChip;
			if (centre == null) return [];
			const members = layout[edge].map((index) => placedLevels[index]);
			const allPinned = members.every((level) => level.pinned === edge);
			return [{ edge, members, allPinned, top: centre - LEVEL_LABEL / 2, text: levelGroupText(edge, members) }];
		});
	});

	// The edge group whose levels are listed under the chart, opened by its
	// chip as a disclosure, as a group of trades is.
	let openEdge = $state<LevelEdge | null>(null);
	const openGroup = $derived(levelGroups.find((group) => group.edge === openEdge) ?? null);
	const levelListShown = $derived(!inspected && openGroup != null);
	const levelListId = `${uid}-levels`;

	function toggleLevels(edge: LevelEdge) {
		openEdge = openEdge === edge ? null : edge;
		pickedGroup = null;
		hoveredGroup = null;
		pickChanged = true;
	}

	// A chip moves left of the latest price rather than cover it: the line's
	// end dot, or the last candle from its high to its low.
	let chipWidths = $state<Record<string, number>>({});
	function chipRight(edge: LevelEdge, top: number): number {
		if (!ready || !last) return 0;
		const x = pointLeft(lastIndex);
		const width = chipWidths[edge] ?? 0;
		const high = yAt(candles && isCandle(last) ? last.h : last.p);
		const low = yAt(candles && isCandle(last) ? last.l : last.p);
		const covers = x >= plotWidth - width - END_DOT_REACH && low >= top - END_DOT_REACH && high <= top + LEVEL_LABEL + END_DOT_REACH;
		return covers ? Math.max(0, plotWidth - x) + 2 * END_DOT_REACH : 0;
	}

	/** The ring and badge side of a marker or group, as a class. */
	function sideClass(members: SeriesMarker[]) {
		return clusterSide(members);
	}
</script>

<svelte:window onkeydown={onWindowKey} />

{#snippet sideShape(side: 'buy' | 'sell' | 'mixed', size: number)}
	<!-- Shape as well as colour: up for a buy, down for a sell, both for a mix. -->
	<svg viewBox="0 0 12 12" width={size} height={size} aria-hidden="true" class="shape">
		{#if side === 'buy'}
			<polygon class="buy-fill" points="6,1 11.5,10.5 0.5,10.5" />
		{:else if side === 'sell'}
			<polygon class="sell-fill" points="0.5,1.5 11.5,1.5 6,11" />
		{:else}
			<polygon class="buy-fill" points="6,0.5 10.5,5.25 1.5,5.25" />
			<polygon class="sell-fill" points="1.5,6.75 10.5,6.75 6,11.5" />
		{/if}
	</svg>
{/snippet}

{#if !bounds}
	<div class="sui-series-frame"><p class="sui-series-empty" style={sizing}>{empty}</p></div>
{:else if plotFailed}
	<div class="sui-series-frame"><p class="sui-series-empty" style={sizing}>{failed}</p></div>
	<SeriesHintRow {noun} {hint} markersPossible={markersPossible} />
{:else}
	<div
		class="sui-series-chart {extraClass}"
		style="--stroke: {lineColor}"
		bind:this={plotElement}
		onpointermove={onPlotPointer}
		onpointerdown={onPlotPointer}
		onpointerleave={(event) => {
			if (event.pointerType !== 'touch') stopInspecting();
		}}
		onpointercancel={stopInspecting}
		role="presentation"
	>
		<div class="plot" style={sizing}>
			<!-- Before the chart, so keyboard focus reaches it before the trade
			     markers. It sits on the inspected point, so screen magnifiers follow.
			     Only the picture below carries the summary, so reading straight
			     through does not announce it twice. -->
			<input
				class="scrub"
				style={ready && sliderPoint ? `left: ${pointLeft(Math.min(sliderIndex, lastIndex))}px; top: ${yAt(sliderPoint.p)}px` : undefined}
				type="range"
				min="0"
				max={plotted.length - 1}
				step="1"
				value={sliderIndex}
				aria-label={label}
				aria-valuetext={sliderText}
				onfocus={() => {
						pickedGroup = null;
					inspectIndex(sliderIndex);
				}}
				onblur={() => {
						stopInspecting();
				}}
				oninput={(event) => inspectIndex(event.currentTarget.valueAsNumber)}
			/>

			<!-- Behind the picture: the guides and the zero line. -->
			<div class="layer back" aria-hidden="true">
				{#if ready}
					{#each guideLines as value (value)}
						<span class="guide" style="top: {yAt(value)}px"></span>
					{/each}
					{#if baseline}
						<span class="zero" style="top: {yAt(0)}px"></span>
					{/if}
				{/if}
			</div>

			<!-- The picture of the chart for screen readers, and where a pointer
			     or finger inspects it. -->
			<div class="layer touch" bind:this={overlay} role="img" aria-label={label} aria-describedby={description ? `${uid}-summary` : undefined}></div>
			<!-- Visually hidden rather than hidden, so browse mode reads it too. -->
			<span id="{uid}-summary" class="visually-hidden">{description}</span>

			<!-- Over the picture: the labels, the levels, the crosshair and the
			     dots. They repeat what the slider, the summary and the readout
			     say, so screen readers skip them. -->
			<div class="layer front" aria-hidden="true">
				{#if ready}
					{#each placedLevels as level, index (level.key)}
						<!-- A level's line at its value, or none when it is pinned to an edge. -->
						{#if !level.pinned}
							<span class="level-line {level.tone ?? 'neutral'}" class:dashed={level.dashed} style="top: {yAt(level.value)}px"></span>
						{/if}
					{/each}
					{#each labelledGuides as value (value)}
						<span class="guide-label" style="top: {yAt(value)}px">{formatAxis(value)}</span>
					{/each}
					{#each tickLabels as tick, index (tick.t)}
						<span class="tick" class:first={index === 0} class:last={index === tickLabels.length - 1} style="left: {pointLeft(tick.index)}px">{tick.label}</span>
					{/each}
					{#each lone as index (plotted[index].t)}
						<span class="lone" style="left: {pointLeft(index)}px; top: {yAt(plotted[index].p)}px"></span>
					{/each}
					{#if baseline}
						<span class="zero-label" style="top: {yAt(0)}px">{formatAxis(0)}</span>
					{/if}
					{#if !candles && last && !active}
						<!-- The latest point, pulsing a few times when it is live, and
						     again when a new one arrives. -->
						{#key last.t}
							<span
								class="dot end"
								class:live
								class:animate
								style="left: {pointLeft(lastIndex)}px; top: {yAt(last.p)}px{baseline ? `; --stroke: ${last.p >= 0 ? 'var(--up)' : 'var(--down)'}` : ''}"
							></span>
						{/key}
					{/if}
					{#if active && inspectedIndex != null}
						{@const left = pointLeft(inspectedIndex)}
						{@const top = yAt(active.p)}
						<span class="cursor vertical" style="left: {left}px"></span>
						<span class="cursor horizontal" style="top: {top}px"></span>
						{#if !candles}
							<!-- With a baseline the inspected point is a gain or a loss by its side of zero. -->
							<span class="dot" style="left: {left}px; top: {top}px{baseline ? `; --stroke: ${active.p >= 0 ? 'var(--up)' : 'var(--down)'}` : ''}"></span>
						{/if}
						<span class="level-label" style="top: {top}px">{formatAxis(active.p)}</span>
					{/if}
				{/if}
			</div>

			<!-- The trades, as buttons, grouped where they would cover each other. -->
			<div class="layer markers" bind:this={markersLayer}>
				{#each clusters as cluster (clusterKey(cluster.members))}
					{@const members = cluster.members}
					{@const key = clusterKey(members)}
					{@const side = sideClass(members)}
					{@const face = faceOf(members[0])}
					<button
						type="button"
						class="marker {side}"
						data-trades={members.map(markerKey).join('\n')}
						class:picked={pickedKey === key}
						class:face={face.kind !== 'shape'}
						style="left: {cluster.left}px; top: {cluster.top}px"
						aria-label={clusterLabel(members, formatTime, withYear)}
						aria-pressed={members.length === 1 ? pickedKey === key : undefined}
						aria-expanded={members.length > 1 ? pickedKey === key : undefined}
						aria-controls={members.length > 1 && pickedKey === key && listShown ? pickedListId : undefined}
						onclick={() => togglePick(members)}
						onpointerenter={(event) => {
							touching = event.pointerType === 'touch';
							showGroup(members);
						}}
						onpointerleave={leaveGroup}
						onfocus={() => {
							touching = false;
							focusedTrade = markerKey(members[0]);
							showGroup(members);
						}}
						onblur={(event) => {
							leaveGroup();
							const button = event.currentTarget;
							// A button removed by a regroup keeps its trade for the new group to take focus.
							queueMicrotask(() => {
								if (button.isConnected) focusedTrade = null;
							});
						}}
					>
						{#if face.kind === 'image'}
							<img class="avatar" src={face.src} alt="" width="18" height="18" loading="lazy" decoding="async" draggable="false" onerror={() => avatarFailed(face.src)} />
						{:else if face.kind === 'initials'}
							<span class="avatar initials" aria-hidden="true">{face.text}</span>
						{:else}
							{@render sideShape(side, 11)}
						{/if}
						{#if face.kind !== 'shape'}
							<span class="side-badge" aria-hidden="true">{@render sideShape(side, 7)}</span>
						{/if}
						{#if members.length > 1}
							<span class="count" aria-hidden="true">+{members.length - 1}</span>
						{/if}
					</button>
				{/each}
			</div>

			<!-- The levels' tags at the right edge, over the markers so a trade
			     never hides what a level is; presses pass through to the markers.
			     Levels beyond an edge, or with no room for a tag, are in its chip. -->
			<!-- Under the crosshair and its value while something is inspected. -->
			<div class="layer levels" class:under={active != null} aria-hidden="true">
				{#if ready}
					{#each placedLevels as level, index (level.key)}
						{@const top = levelLabelTops[index]}
						{#if top != null}
							<span class="level-tag {level.tone ?? 'neutral'}" class:faded={coversEnd(index)} style="top: {top}px" bind:offsetWidth={levelTagWidths[index]}>
								<span>{level.label}</span>
								<span class="level-value">{formatAxis(level.value)}</span>
							</span>
						{/if}
					{/each}
				{/if}
			</div>

			<!-- The levels gathered at an edge, one chip each, after the markers
			     in the tab order. The arrow and the words say which way they
			     lie; a press lists them under the chart. -->
			<div class="layer level-chips" class:under={active != null}>
				{#each levelGroups as group (group.edge)}
					<button
						type="button"
						class="level-chip {group.edge}"
						class:open={openEdge === group.edge}
						style="top: {group.top}px; right: {chipRight(group.edge, group.top)}px"
						bind:offsetWidth={chipWidths[group.edge]}
						aria-label={group.text.name}
						aria-expanded={openEdge === group.edge}
						aria-controls={openEdge === group.edge && levelListShown ? levelListId : undefined}
						onclick={() => toggleLevels(group.edge)}
						onpointerenter={() => {
							inspectedIndex = null;
							pointerInGap = false;
						}}
					>
						<svg viewBox="0 0 8 8" width="8" height="8" aria-hidden="true">
							<polygon points={group.edge === 'above' ? '4,0.5 7.5,7 0.5,7' : '0.5,1 7.5,1 4,7.5'} />
						</svg>
						<span>{group.text.chip}</span>
					</button>
				{/each}
			</div>

			{#if ready && tooltipShown}
				<div class="tooltip" class:flip={tooltipLeft > plotWidth / 2} style="left: {tooltipLeft}px" aria-hidden="true">
					{#if inspected}
						<div class="tooltip-label">{formatTime(inspected.t, withYear)}</div>
						{#if candles && isCandle(inspected)}
							<dl class="ohlc" class:rise={inspected.p >= inspected.o} class:fall={inspected.p < inspected.o}>
								<dt>O</dt><dd>{format(inspected.o)}</dd>
								<dt>H</dt><dd>{format(inspected.h)}</dd>
								<dt>L</dt><dd>{format(inspected.l)}</dd>
								<dt>C</dt><dd>{format(inspected.p)}</dd>
							</dl>
						{:else}
							<span class="tooltip-value">{format(inspected.p)}</span>
						{/if}
					{/if}
				</div>
			{/if}

			<!-- LayerChart paints here. -->
			<div class="host" bind:this={host}>
				{#if Plot}
					<Plot bind:context {plotted} {candles} {baseline} byTime={byTime && plotted.length > 1 && plotted[plotted.length - 1].t > plotted[0].t} {yDomain} pad={PAD} id="sui-series-{uid.replace(/[^a-zA-Z0-9_-]/g, '')}" />
				{/if}
			</div>
		</div>
	</div>

	<SeriesHintRow {noun} {hint} markersPossible={markersPossible || withMarkers} standIn={false}>
		<div class="readout-inspected" aria-live={readoutLive ? 'polite' : 'off'}>
			{#if shownGroup && shownGroup.length === 1}
				{@const trade = shownGroup[0]}
				<strong class={trade.side === 'buy' ? 'buy-text' : 'sell-text'}>{trade.title}</strong>
				<span>{formatTime(trade.t, withYear)}</span>
				{#if trade.note}
					<span class={trade.note.up ? 'up-text' : 'down-text'}>{trade.note.text}</span>
				{/if}
			{:else if shownGroup && shownGroup === pickedGroup && listShown}
				<!-- Says the pick, so the press is heard; the list follows. -->
				<strong>{shownGroup.length} trades picked</strong>
				<span>{groupSpan(shownGroup)}<span class="visually-hidden">, listed below</span></span>
			{:else if shownGroup}
				<strong>{shownGroup.length} trades</strong>
				<span>{groupSpan(shownGroup)}</span>
			{:else if levelListShown && openGroup}
				<!-- Says what opened, so the press is heard; the list follows. -->
				<strong>{openGroup.text.heading}</strong>
			{:else if inspected && pointerInGap}
				<span class="hint">No snapshots in this gap</span>
			{:else if inspected}
				<strong>{#if candles}<span class="visually-hidden">close </span>{/if}{format(inspected.p)}</strong>
				<span>{formatTime(inspected.t, withYear)}</span>
				{#if candles && isCandle(inspected)}
					<span class="candle-text">{candleText(inspected)}</span>
				{/if}
				{#if changeText}
					<span class={changeText.up ? 'up-text' : 'down-text'}>{changeText.text}</span>
				{/if}
			{/if}
		</div>
		{#if listShown && pickedGroup}
			<!-- Outside the live part, so a press announces the count and not
			     every trade; the list stays while other markers are focused on the way to it. -->
			<!-- A list that scrolls takes focus, so a keyboard can scroll it. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul id={pickedListId} class="trade-list" class:scrolls={pickedGroup.length > LIST_ROWS} tabindex={pickedGroup.length > LIST_ROWS ? 0 : undefined} aria-label="{pickedGroup.length} trades picked">
				{#each pickedGroup as trade (markerKey(trade))}
					<li>
						<strong class={trade.side === 'buy' ? 'buy-text' : 'sell-text'}>{trade.title}</strong>
						<span>{formatTime(trade.t, withYear)}</span>
						{#if trade.note}
							<span class={trade.note.up ? 'up-text' : 'down-text'}>{trade.note.text}</span>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
		{#if levelListShown && openGroup}
			<!-- Outside the live part, as a group's trades are. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul
				id={levelListId}
				class="trade-list level-list"
				class:scrolls={openGroup.members.length > LIST_ROWS}
				tabindex={openGroup.members.length > LIST_ROWS ? 0 : undefined}
				aria-label={openGroup.text.heading}
			>
				{#each openGroup.members as level (level.key)}
					<li>
						<span class="level-swatch {level.tone ?? 'neutral'}" class:dashed={level.dashed} aria-hidden="true"></span>
						<strong>{level.label}</strong>
						<span>{format(level.value)}</span>
						{#if level.pinned && !openGroup.allPinned}
							<span>{level.pinned} the chart</span>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
		{#if !shownGroup && !inspected && !levelListShown}
			{#if hint}
				<span class="hint">{hint}</span>
			{:else}
				<ChartHint {noun} {withMarkers} />
			{/if}
		{/if}
	</SeriesHintRow>
{/if}

<style>
	/* A sideways drag inspects and an upward one scrolls the page. */
	.sui-series-chart {
		position: relative;
		touch-action: pan-y;
	}
	/* The plot's height follows these boxes' width. As size containers they
	   are as wide as their parent gives them, whatever is inside. */
	.sui-series-chart,
	.sui-series-frame {
		container-type: inline-size;
	}
	.sui-series-chart:has(.scrub:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}
	/* Its own stacking order: the guides behind the picture, the labels,
	   markers and tooltip over it. */
	.plot {
		position: relative;
		isolation: isolate;
		width: 100%;
	}
	.host {
		position: absolute;
		inset: 0;
	}
	.layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.layer.back {
		z-index: -1;
	}
	.layer.touch {
		z-index: 2;
		pointer-events: auto;
	}
	.layer.front {
		z-index: 4;
		overflow: hidden;
	}
	.layer.markers {
		z-index: 5;
	}
	.layer.levels {
		z-index: 6;
		overflow: hidden;
	}
	.layer.levels.under {
		z-index: 3;
	}
	.scrub {
		position: absolute;
		left: 100%;
		top: 50%;
		width: 1px;
		height: 1px;
		margin: 0;
		padding: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
	}

	/* The guides, the zero line and the crosshair: dashed 1px lines. */
	.guide,
	.zero,
	.cursor {
		position: absolute;
		pointer-events: none;
	}
	.guide,
	.zero,
	.cursor.horizontal {
		left: 0;
		right: 0;
		height: 1px;
	}
	.guide {
		background: repeating-linear-gradient(to right, var(--border) 0 2px, transparent 2px 6px);
		opacity: 0.8;
	}
	.zero {
		background: repeating-linear-gradient(to right, var(--muted) 0 4px, transparent 4px 8px);
	}
	.cursor.horizontal {
		background: repeating-linear-gradient(to right, var(--border-strong) 0 3px, transparent 3px 6px);
	}
	.cursor.vertical {
		top: 0;
		bottom: 0;
		width: 1px;
		background: repeating-linear-gradient(to bottom, var(--border-strong) 0 3px, transparent 3px 6px);
	}
	.guide-label,
	.tick,
	.zero-label,
	.level-label {
		position: absolute;
		padding: 0 var(--space-1);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--card) 85%, transparent);
		color: var(--muted);
		font-size: var(--text-2xs);
		line-height: 1.4;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		pointer-events: none;
	}
	.guide-label {
		left: 0;
		transform: translateY(-100%);
		opacity: 0.9;
	}
	.tick {
		bottom: 0;
		transform: translateX(-50%);
	}
	.tick.first {
		transform: none;
	}
	.tick.last {
		transform: translateX(-100%);
	}
	.zero-label {
		left: 0;
		transform: translateY(-100%);
	}
	.level-label {
		right: 0;
		transform: translateY(-50%);
		background: var(--fg);
		color: var(--bg);
		font-weight: 600;
	}
	/* A level: a 1px line across the plot in its tone, dashed when pending,
	   and a tag at the right edge whose words say what it is, so the colour
	   is never the only signal. Above the series, under the markers. */
	.level-line {
		position: absolute;
		left: 0;
		right: 0;
		height: 1px;
		margin-top: -0.5px;
		background: var(--level);
		opacity: 0.9;
	}
	.level-line.dashed {
		background: repeating-linear-gradient(to right, var(--level) 0 5px, transparent 5px 9px);
	}
	.level-tag {
		position: absolute;
		right: 0;
		display: flex;
		align-items: center;
		gap: var(--space-1);
		box-sizing: border-box;
		height: 16px;
		max-width: 70%;
		padding: 0 var(--space-1);
		border: 1px solid var(--level);
		border-radius: var(--radius-sm);
		background: var(--card);
		color: var(--fg);
		font-size: var(--text-2xs);
		line-height: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.level-tag.faded {
		opacity: 0.85;
	}
	.level-value {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
	/* An edge's levels as one chip, a button with a 24px target, 44px on a
	   touch screen, that reaches into the plot and never out of it. */
	.layer.level-chips {
		z-index: 6;
	}
	.layer.level-chips.under {
		z-index: 3;
	}
	.level-chip {
		position: absolute;
		display: flex;
		align-items: center;
		gap: var(--space-1);
		box-sizing: border-box;
		height: 16px;
		margin: 0;
		padding: 0 var(--space-1-5);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		background: var(--card);
		color: var(--fg);
		font: inherit;
		font-size: var(--text-2xs);
		font-weight: 600;
		line-height: 1;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		cursor: pointer;
		pointer-events: auto;
	}
	.level-chip::before {
		content: '';
		position: absolute;
		inset: 0 -1px -9px;
	}
	.level-chip.below::before {
		inset: -9px -1px 0;
	}
	.level-chip svg {
		flex: none;
		fill: currentColor;
	}
	.level-chip:hover {
		background: var(--card-alt);
	}
	.level-chip.open {
		border-color: var(--fg);
		background: var(--fg);
		color: var(--bg);
	}
	.level-chip:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	@media (pointer: coarse) {
		.level-chip::before {
			inset: 0 -6px -29px;
		}
		.level-chip.below::before {
			inset: -29px -6px 0;
		}
	}
	/* An edge's levels listed, each after a short line in its tone, dashed when pending. */
	.level-list li {
		align-items: center;
	}
	.level-swatch {
		flex: none;
		width: 12px;
		height: 2px;
		background: var(--level);
	}
	.level-swatch.dashed {
		background: repeating-linear-gradient(to right, var(--level) 0 4px, transparent 4px 6px);
	}
	.up {
		--level: var(--up);
	}
	.down {
		--level: var(--down);
	}
	.neutral {
		--level: var(--muted);
	}
	.lone {
		position: absolute;
		width: 4px;
		height: 4px;
		margin: -2px 0 0 -2px;
		border-radius: 50%;
		background: var(--stroke);
	}
	.dot {
		position: absolute;
		width: 9px;
		height: 9px;
		margin: -4.5px 0 0 -4.5px;
		box-sizing: border-box;
		border-radius: 50%;
		background: var(--card);
		border: 2px solid var(--stroke);
		pointer-events: none;
	}
	.dot.end {
		background: var(--stroke);
	}
	.dot.end::after {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: 50%;
		background: var(--stroke);
		opacity: 0;
	}
	@media (prefers-reduced-motion: no-preference) {
		.dot.end.animate {
			animation: sui-series-fade 300ms ease-out 900ms both;
		}
		.dot.end.live::after {
			/* A few pulses, not forever (WCAG 2.2.2); a new last point starts them again. */
			animation: sui-series-pulse 2s ease-out 3;
		}
	}
	@keyframes sui-series-fade {
		from {
			opacity: 0;
		}
	}
	@keyframes sui-series-pulse {
		from {
			transform: scale(1);
			opacity: 0.7;
		}
		to {
			transform: scale(3);
			opacity: 0;
		}
	}

	/* Trade markers: a 24px target around an 11px shape, or the trader's
	   picture or initials in an 18px circle with a ring in the side's colour
	   and a badge with the side's shape, so buy and sell never rest on colour. */
	.marker {
		--ring: var(--up);
		position: absolute;
		width: 24px;
		height: 24px;
		margin: -12px 0 0 -12px;
		padding: 0;
		display: grid;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--fg);
		cursor: pointer;
		pointer-events: auto;
	}
	.marker.sell {
		--ring: var(--down);
	}
	.marker.mixed {
		--ring: var(--border-strong);
	}
	.marker .shape {
		overflow: visible;
	}
	.marker .shape polygon {
		stroke: var(--bg);
		stroke-width: 1.5;
		stroke-linejoin: round;
		paint-order: stroke;
	}
	.buy-fill {
		fill: var(--up);
	}
	.sell-fill {
		fill: var(--down);
	}
	.avatar {
		box-sizing: border-box;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		object-fit: cover;
		background: var(--card-alt);
		box-shadow:
			0 0 0 2px var(--ring),
			0 0 0 3px var(--bg);
	}
	.initials {
		display: grid;
		place-items: center;
		color: var(--fg);
		font-size: 8px;
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.02em;
	}
	.side-badge {
		position: absolute;
		right: -1px;
		bottom: -1px;
		display: grid;
		place-items: center;
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background: var(--bg);
	}
	.side-badge .shape polygon {
		stroke-width: 0;
	}
	.count {
		position: absolute;
		top: -5px;
		right: -7px;
		min-width: 14px;
		height: 14px;
		padding: 0 3px;
		box-sizing: border-box;
		border-radius: 7px;
		background: var(--fg);
		color: var(--bg);
		font-size: 9px;
		font-weight: 600;
		line-height: 14px;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}
	.marker::after {
		content: '';
		position: absolute;
		inset: 3px;
		border-radius: 50%;
		pointer-events: none;
	}
	.marker.face::after {
		inset: -2px;
	}
	.marker.picked::after {
		box-shadow: 0 0 0 2px var(--fg);
	}
	.marker:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	/* A finger needs a 44px target; the picture and ring stay the same size. */
	@media (pointer: coarse) {
		.marker {
			width: 44px;
			height: 44px;
			margin: -22px 0 0 -22px;
		}
		.marker::after {
			inset: 13px;
		}
		.marker.face::after {
			inset: 8px;
		}
		.side-badge {
			right: 9px;
			bottom: 9px;
		}
		.count {
			top: 5px;
			right: 3px;
		}
	}
	@media (prefers-reduced-motion: no-preference) {
		.marker .shape,
		.marker .avatar {
			transition: transform 120ms;
		}
		.marker:hover > .shape,
		.marker:focus-visible > .shape,
		.marker:hover > .avatar,
		.marker:focus-visible > .avatar {
			transform: scale(1.2);
		}
	}

	/* The tooltip, beside the inspected point or marker, never under a finger. */
	.tooltip {
		position: absolute;
		top: var(--space-2);
		z-index: 7;
		display: grid;
		gap: var(--space-1);
		min-width: 7rem;
		max-width: 16rem;
		margin-left: var(--space-3);
		padding: var(--space-1-5) var(--space-2-5);
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		color: var(--fg);
		font-size: var(--text-xs);
		pointer-events: none;
	}
	.tooltip.flip {
		margin-left: 0;
		transform: translateX(calc(-100% - var(--space-3)));
	}
	.tooltip-label {
		font-weight: 500;
	}
	.tooltip-value {
		font-family: var(--font-mono);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.ohlc {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-0-5) var(--space-2);
		margin: 0;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}
	.ohlc dt {
		color: var(--muted);
	}
	.ohlc dd {
		margin: 0;
		text-align: right;
		font-weight: 500;
	}
	.ohlc.rise dd:last-of-type {
		color: var(--up);
	}
	.ohlc.fall dd:last-of-type {
		color: var(--down);
	}

	/* The readout under the chart, in SeriesHintRow's row. */
	/* Empty while the hint shows, so it takes no room. */
	.readout-inspected {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-0-5) var(--space-3);
		align-items: baseline;
	}
	:global(.sui-series-readout) span {
		font-size: var(--text-sm);
	}
	:global(.sui-series-readout) span:not(.up-text, .down-text) {
		color: var(--muted);
	}
	.buy-text,
	.up-text {
		color: var(--up);
	}
	.sell-text,
	.down-text {
		color: var(--down);
	}
	/* A picked group's trades, one a line, scrolling past a few. */
	.trade-list {
		flex-basis: 100%;
		display: grid;
		gap: var(--space-1);
		margin: var(--space-1) 0 0;
		padding: 0;
		list-style: none;
	}
	.trade-list.scrolls {
		max-height: 7.5rem;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.trade-list:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}
	.trade-list li {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-0-5) var(--space-3);
		align-items: baseline;
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
	.sui-series-empty {
		display: grid;
		place-items: center;
		margin: 0;
		padding: 0 var(--space-4);
		text-align: center;
		color: var(--muted);
		font-size: var(--text-md);
	}
	.hint {
		color: var(--muted);
		font-size: var(--text-md);
	}
</style>
