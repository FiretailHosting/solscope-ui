<script lang="ts">
	import type { IChartApi, ISeriesApi, Logical, SeriesType } from 'lightweight-charts';
	import { tick, untrack } from 'svelte';
	import { forgetAvatarWaiter, loadAvatar, avatarStatus, settleAvatar } from '../../../chart/avatars.js';
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
		candleReading,
		carriedIndex,
		chartRows,
		chartSlots,
		colorWithAlpha,
		guideLabels,
		guideValues,
		hasCandles,
		inGap,
		isCandle,
		lonePoints,
		markerKey,
		markersInTime,
		nearestIndex,
		plotPoints,
		seriesSummary,
		slotAtTime,
		timeTicks,
		valueBounds,
		withinPlotHeight,
		xAtSlot,
		type PlottedPoint,
		type SeriesMarker,
		type SeriesPoint
	} from '../../../chart/series.js';
	import ChartHint from './ChartHint.svelte';

	// A price or value over time, drawn by Lightweight Charts (TradingView,
	// Apache-2.0) on a canvas, and inspected by pointer, finger, keyboard and
	// screen reader alike. The canvas only paints the line, area or candles;
	// everything a person reads or reaches is DOM laid over it with the
	// chart's own coordinates: the guides and time labels, the crosshair, a
	// tooltip for a mouse, the readout under the chart for touch and screen
	// readers, a hidden range slider for the keyboard, and the trade markers
	// as real buttons. Escape hides the tooltip.

	const uid = $props.id();

	let {
		points = [],
		kind = 'line',
		height = 260,
		markers = [],
		label = 'Price history',
		noun = 'price',
		hint,
		empty = 'Not enough history to draw a chart.',
		summary,
		byTime = false,
		gap = 0,
		fixed = false,
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
		label?: string;
		/** What a point is, for the default hint: "price", "market cap". */
		noun?: string;
		/** Text under the chart while nothing is inspected; by default, how to inspect. */
		hint?: string;
		/** Shown in place of the chart when there are fewer than two points. */
		empty?: string;
		/** The chart's description for screen readers; by default its span, start, end, high and low. */
		summary?: string;
		/** Place points by their time rather than evenly, so gaps show. */
		byTime?: boolean;
		/** With byTime, break the line where points are further apart than this, in ms. */
		gap?: number;
		/** Keep height in pixels at any width, rather than scaling with it. */
		fixed?: boolean;
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
	const markersAlong = $derived(markersInTime(points, markers));
	const withYear = $derived(spansYears(points));
	const spanMs = $derived(points.length > 1 ? points[points.length - 1].t - points[0].t : 0);
	// Each point's slot on the canvas's evenly spaced time scale, and what
	// fills every slot: the points, the line between them, or nothing.
	const slots = $derived(chartSlots(plotted, byTime, gap));
	const rows = $derived(chartRows(plotted, slots, candles));
	const description = $derived(summary ?? seriesSummary(points, candles, format, formatTime, withYear));

	// Green when the range ends higher than it started, red when lower. The
	// line, its fill and the end dot all take this one colour.
	const up = $derived(points.length > 1 ? points[points.length - 1].p >= points[0].p : true);
	const lineColor = $derived(up ? 'var(--up)' : 'var(--down)');
	const sizing = $derived(fixed ? `height: ${height}px` : `aspect-ratio: 800 / ${height}`);

	// The canvas chart. It is made in the browser once the plot is on the
	// page, from a chunk of its own, so pages without a chart and server
	// rendering never load it. Its coordinates change on every resize and new
	// series, and layoutVersion moves then, so what is placed with them moves.
	let host = $state<HTMLElement>();
	let plotElement = $state<HTMLElement>();
	let overlay = $state<HTMLElement>();
	let library_: typeof import('lightweight-charts') | null = null;
	let chart: IChartApi | null = null;
	let series: ISeriesApi<SeriesType> | null = null;
	let seriesShape = '';
	let ready = $state(false);
	let layoutVersion = $state(0);
	let plotWidth = $state(0);
	let plotHeight = $state(0);

	/** xAt is the left of a fractional slot on the plot, in pixels. */
	function xAt(slot: number): number {
		void layoutVersion;
		if (!chart) return 0;
		// The time scale converts whole slots; a slot between two is placed between them.
		const scale = chart.timeScale();
		const below = Math.floor(slot);
		const from = scale.logicalToCoordinate(below as Logical) ?? 0;
		if (slot === below) return from;
		const to = scale.logicalToCoordinate((below + 1) as Logical) ?? from;
		return from + (to - from) * (slot - below);
	}

	/** yAt is the top of a value on the plot, in pixels. */
	function yAt(value: number): number {
		void layoutVersion;
		return series?.priceToCoordinate(value) ?? 0;
	}

	/** pointLeft is where the plotted point at this index sits across the plot. */
	function pointLeft(index: number): number {
		return xAt(slots[index] ?? 0);
	}

	// The theme's colours, for the canvas, which cannot read CSS variables.
	// Read again when the theme changes, by the toggle or the system.
	let palette = $state({ up: '', down: '' });

	function readPalette() {
		if (!plotElement) return;
		const style = getComputedStyle(plotElement);
		const next = { up: style.getPropertyValue('--up').trim() || '#1d7a4c', down: style.getPropertyValue('--down').trim() || '#b4322c' };
		if (next.up !== palette.up || next.down !== palette.down) palette = next;
	}

	$effect(() => {
		if (!plotElement) return;
		readPalette();
		const dark = window.matchMedia('(prefers-color-scheme: dark)');
		const observer = new MutationObserver(readPalette);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
		dark.addEventListener('change', readPalette);
		return () => {
			observer.disconnect();
			dark.removeEventListener('change', readPalette);
		};
	});

	// A finger needs markers further apart before they group.
	let coarse = $state(false);
	$effect(() => {
		const query = window.matchMedia('(pointer: coarse)');
		const update = () => (coarse = query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	let layoutFrame = 0;
	/** relayout moves the DOM layer once the canvas has redrawn, at most once a frame. */
	function relayout() {
		if (layoutFrame) return;
		layoutFrame = requestAnimationFrame(() => {
			layoutFrame = 0;
			if (!host || !chart) return;
			plotWidth = host.clientWidth;
			plotHeight = host.clientHeight;
			layoutVersion++;
		});
	}

	/** fit keeps the whole series in view with PAD pixels above and below it, as the plot's size changes. */
	function fit() {
		if (!host || !chart) return;
		const margin = host.clientHeight > 0 ? Math.min(0.2, PAD / host.clientHeight) : 0.05;
		chart.priceScale('right').applyOptions({ scaleMargins: { top: margin, bottom: margin } });
		chart.timeScale().fitContent();
		relayout();
	}

	/** labelAttribution names TradingView's attribution link, which its license asks to keep, and keeps it out of the way. */
	function labelAttribution() {
		const link = host?.querySelector<HTMLAnchorElement>('a#tv-attr-logo');
		if (!link) return;
		link.setAttribute('aria-label', 'Charting by TradingView (opens in a new tab)');
		link.setAttribute('rel', 'noopener');
		link.removeAttribute('title');
		link.classList.add('sui-series-attribution');
		link.querySelector('svg')?.setAttribute('aria-hidden', 'true');
	}

	// Made once the plot is on the page, and removed with it.
	$effect(() => {
		const element = host;
		if (!element) return;
		let disposed = false;
		let resizeObserver: ResizeObserver | undefined;
		import('lightweight-charts').then((library) => {
			if (disposed) return;
			library_ = library;
			chart = library.createChart(element, {
				autoSize: true,
				layout: { background: { type: library.ColorType.Solid, color: 'transparent' }, attributionLogo: true, textColor: '#888' },
				grid: { vertLines: { visible: false }, horzLines: { visible: false } },
				rightPriceScale: { visible: false, scaleMargins: { top: 0.05, bottom: 0.05 } },
				leftPriceScale: { visible: false },
				timeScale: { visible: false, fixLeftEdge: true, fixRightEdge: true, rightOffset: 0, minBarSpacing: 0.001, lockVisibleTimeRangeOnResize: true },
				crosshair: { mode: library.CrosshairMode.Hidden, vertLine: { visible: false, labelVisible: false }, horzLine: { visible: false, labelVisible: false } },
				handleScroll: false,
				handleScale: false,
				kineticScroll: { touch: false, mouse: false }
			});
			// The chart lays itself out in a table; it is not a data table.
			element.querySelector('table')?.setAttribute('role', 'presentation');
			labelAttribution();
			chart.timeScale().subscribeVisibleLogicalRangeChange(relayout);
			resizeObserver = new ResizeObserver(fit);
			resizeObserver.observe(element);
			ready = true;
		});
		return () => {
			disposed = true;
			resizeObserver?.disconnect();
			if (layoutFrame) cancelAnimationFrame(layoutFrame);
			layoutFrame = 0;
			chart?.remove();
			chart = null;
			series = null;
			seriesShape = '';
			ready = false;
		};
	});

	let currentBounds: { min: number; span: number } | null = null;
	let revealedKey = '';

	// Draws the series whenever the points, the kind or the theme change.
	$effect(() => {
		const data = rows;
		const shape = candles ? 'candles' : baseline ? 'baseline' : 'area';
		const colors = { ...palette, line: up ? palette.up : palette.down };
		const fitBounds = bounds;
		const first = plotted[0]?.t;
		if (!ready) return;
		untrack(() => {
			if (!chart || !library_) return;
			currentBounds = fitBounds;
			if (shape !== seriesShape) {
				if (series) chart.removeSeries(series);
				series = addSeries(library_, chart, shape);
				seriesShape = shape;
			}
			series?.applyOptions(seriesColors(shape, colors));
			series?.setData(data as never[]);
			fit();
			// The theme also redraws the attribution logo.
			labelAttribution();
			reveal(`${shape}|${first}`);
		});
	});

	function addSeries(library: typeof import('lightweight-charts'), target: IChartApi, shape: string): ISeriesApi<SeriesType> {
		const common = {
			priceLineVisible: false,
			lastValueVisible: false,
			// The view fits the data rather than zero, or keeps zero in view with a baseline.
			autoscaleInfoProvider: () => (currentBounds ? { priceRange: { minValue: currentBounds.min, maxValue: currentBounds.min + currentBounds.span } } : null)
		};
		if (shape === 'candles') return target.addSeries(library.CandlestickSeries, { ...common, borderVisible: true });
		if (shape === 'baseline') {
			return target.addSeries(library.BaselineSeries, { ...common, baseValue: { type: 'price', price: 0 }, lineWidth: 2, crosshairMarkerVisible: false });
		}
		return target.addSeries(library.AreaSeries, { ...common, lineWidth: 2, crosshairMarkerVisible: false, lineType: library.LineType.Simple });
	}

	/** seriesColors paints the series from the theme: hollow rising candles, a gain and loss baseline, or a line over a fading fill. */
	function seriesColors(shape: string, colors: { up: string; down: string; line: string }) {
		if (shape === 'candles') {
			// Shape as well as colour: a rising candle is hollow, a falling one filled.
			return {
				upColor: 'rgba(0, 0, 0, 0)',
				borderUpColor: colors.up,
				wickUpColor: colors.up,
				downColor: colors.down,
				borderDownColor: colors.down,
				wickDownColor: colors.down
			};
		}
		if (shape === 'baseline') {
			return {
				topLineColor: colors.up,
				topFillColor1: colorWithAlpha(colors.up, 0.28),
				topFillColor2: colorWithAlpha(colors.up, 0.04),
				bottomLineColor: colors.down,
				bottomFillColor1: colorWithAlpha(colors.down, 0.04),
				bottomFillColor2: colorWithAlpha(colors.down, 0.28)
			};
		}
		return { lineColor: colors.line, topColor: colorWithAlpha(colors.line, 0.28), bottomColor: colorWithAlpha(colors.line, 0) };
	}

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
	// While the slider has focus it announces each point itself, and a
	// pointer scrubbing across would announce every point it passes.
	let sliderFocused = $state(false);
	let scrubbing = $state(false);

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
		});
	});

	// The markers in pixels, leaving out those well off the plotted range,
	// and grouped where they would cover each other.
	const clusters = $derived.by((): MarkerCluster<PlacedMarker>[] => {
		void layoutVersion;
		if (!ready || plotHeight <= 0) return [];
		const placed: PlacedMarker[] = [];
		for (const marker of markersAlong) {
			const top = yAt(marker.price);
			if (!withinPlotHeight(top, plotHeight)) continue;
			placed.push({ ...marker, left: xAt(slotAtTime(plotted, slots, marker.t)), top });
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

	// The tooltip shows what is inspected, unless a finger is down or Escape hid it.
	const tooltipShown = $derived(!touching && !tooltipDismissed && (hoveredGroup != null || (inspected != null && !pointerInGap)));
	const hoveredCluster = $derived(hoveredGroup ? clusters.find((cluster) => clusterKey(cluster.members) === clusterKey(hoveredGroup!)) : undefined);
	const tooltipLeft = $derived.by(() => {
		if (hoveredCluster) return hoveredCluster.left;
		return inspectedIndex == null ? 0 : pointLeft(inspectedIndex);
	});

	/** inspectAt finds the point under a pointer at this many pixels from the left of the plot. */
	function inspectAt(left: number) {
		if (!chart || plotted.length === 0) return;
		const logical = chart.timeScale().coordinateToLogical(left);
		if (logical == null) return;
		const x = xAtSlot(plotted, slots, logical);
		const index = nearestIndex(plotted, x);
		inspectedIndex = index;
		pointerInGap = inGap(plotted[index], x, byTime, gap);
		tooltipDismissed = false;
		scrubbing = true;
	}

	function onPlotPointer(event: PointerEvent) {
		const target = event.target as Element;
		if (!overlay || target.closest('.marker, a, .scrub')) return;
		touching = event.pointerType === 'touch';
		inspectAt(event.clientX - overlay.getBoundingClientRect().left);
	}

	/** A marker under the pointer or focus takes over from any inspected point. */
	function showGroup(members: SeriesMarker[]) {
		inspectedIndex = null;
		pointerInGap = false;
		tooltipDismissed = false;
		scrubbing = false;
		hoveredGroup = members;
	}

	function togglePick(members: SeriesMarker[]) {
		pickedGroup = pickedKey === clusterKey(members) ? null : members;
		// A press shows the pick in full, the list of a group's trades with it.
		hoveredGroup = null;
	}

	function stopInspecting() {
		inspectedIndex = null;
		pointerInGap = false;
		touching = false;
		scrubbing = false;
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
		if (event.key === 'Escape' && (inspected || hoveredGroup)) tooltipDismissed = true;
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
		scrubbing = false;
	}

	const withMarkers = $derived(markersAlong.length > 0);
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
	// scrubbing would announce every point, so the readout is only live for
	// the rest, such as a marker picked by pointer. The hint shown while
	// nothing is inspected sits outside the live part, so a caller's hint
	// that changes with every live tick is never read out (WCAG 2.2.2).
	const readoutLive = $derived(!sliderFocused && !scrubbing && !hoveredGroup);

	// The guides and their labels, and the times along the bottom.
	const guideLines = $derived(guides && bounds ? guideValues(bounds.min, bounds.span).filter((value) => !(baseline && value === 0)) : []);
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

	/** The guides that get a label: none in the time axis's row, and one at most on a short chart. */
	const labelledGuides = $derived.by(() => {
		if (!ready) return [];
		const placed = guideLines.map((value) => ({ value, y: yAt(value) }));
		return guideLabels(placed, plotHeight, tickLabels.length > 0 ? TICK_ROW : 0);
	});

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
	<p class="sui-series-empty" style={fixed ? `height: ${height}px` : `aspect-ratio: 800 / ${height}`}>{empty}</p>
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
			     markers. It sits on the inspected point, so screen magnifiers follow. -->
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
				aria-describedby={description ? `${uid}-summary` : undefined}
				onfocus={() => {
					sliderFocused = true;
					pickedGroup = null;
					inspectIndex(sliderIndex);
				}}
				onblur={() => {
					sliderFocused = false;
					stopInspecting();
				}}
				oninput={(event) => inspectIndex(event.currentTarget.valueAsNumber)}
			/>

			<!-- Behind the canvas: the guides and the zero line. -->
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
			<span id="{uid}-summary" hidden>{description}</span>

			<!-- Over the canvas: the labels, the crosshair and the dots. They
			     repeat what the slider and the readout say, so screen readers skip them. -->
			<div class="layer front" aria-hidden="true">
				{#if ready}
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
						aria-pressed={pickedKey === key}
						onclick={() => togglePick(members)}
						onpointerenter={(event) => {
							touching = event.pointerType === 'touch';
							showGroup(members);
						}}
						onpointerleave={() => (hoveredGroup = null)}
						onfocus={() => {
							touching = false;
							focusedTrade = markerKey(members[0]);
							showGroup(members);
						}}
						onblur={(event) => {
							hoveredGroup = null;
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

			{#if ready && tooltipShown}
				<div class="tooltip" class:flip={tooltipLeft > plotWidth / 2} style="left: {tooltipLeft}px" aria-hidden="true">
					{#if hoveredGroup}
						<div class="tooltip-label">{hoveredGroup.length === 1 ? hoveredGroup[0].title : `${hoveredGroup.length} trades`}</div>
						<span class="tooltip-value">{groupSpan(hoveredGroup)}</span>
					{:else if inspected}
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

			<!-- Lightweight Charts paints here, last, so TradingView's
			     attribution link comes after the markers in the tab order. -->
			<div class="host" bind:this={host}></div>
		</div>
	</div>

	<div class="sui-series-readout">
		<div class="readout-inspected" aria-live={readoutLive ? 'polite' : 'off'}>
			{#if shownGroup && shownGroup.length === 1}
				{@const trade = shownGroup[0]}
				<strong class={trade.side === 'buy' ? 'buy-text' : 'sell-text'}>{trade.title}</strong>
				<span>{formatTime(trade.t, withYear)}</span>
				{#if trade.note}
					<span class={trade.note.up ? 'up-text' : 'down-text'}>{trade.note.text}</span>
				{/if}
			{:else if shownGroup}
				<strong>{shownGroup.length} trades</strong>
				<span>{groupSpan(shownGroup)}</span>
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
			<ul class="trade-list" class:scrolls={pickedGroup.length > LIST_ROWS} tabindex={pickedGroup.length > LIST_ROWS ? 0 : undefined} aria-label="{pickedGroup.length} trades picked">
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
		{#if !shownGroup && !inspected}
			{#if hint}
				<span class="hint">{hint}</span>
			{:else}
				<ChartHint {noun} {withMarkers} />
			{/if}
		{/if}
	</div>
{/if}

<style>
	/* A sideways drag inspects and an upward one scrolls the page. */
	.sui-series-chart {
		position: relative;
		touch-action: pan-y;
	}
	.sui-series-chart:has(.scrub:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}
	/* Its own stacking order: the guides behind the canvas, the labels,
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

	/* TradingView's attribution, which its license asks to keep: above the
	   time axis row, with a focus ring. */
	.host :global(a#tv-attr-logo.sui-series-attribution) {
		left: var(--space-1);
		bottom: calc(16px + var(--space-1));
		opacity: 0.7;
	}
	.host :global(a#tv-attr-logo.sui-series-attribution:hover),
	.host :global(a#tv-attr-logo.sui-series-attribution:focus-visible) {
		opacity: 1;
	}
	.host :global(a#tv-attr-logo.sui-series-attribution:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
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
		z-index: 6;
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

	/* The readout under the chart */
	.sui-series-readout {
		min-height: 1.5rem;
		margin-top: var(--space-2);
		font-variant-numeric: tabular-nums;
	}
	/* Empty while the hint shows, so it takes no room. */
	.readout-inspected {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-0-5) var(--space-3);
		align-items: baseline;
	}
	.sui-series-readout span {
		font-size: var(--text-sm);
	}
	.sui-series-readout span:not(.up-text, .down-text) {
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
	/* On a phone the hint and a trade wrap to two lines; keep room for them
	   so the page below does not jump. */
	@media (max-width: 600px) {
		.sui-series-readout {
			min-height: 2.6rem;
		}
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
	.hint,
	.sui-series-readout :global(.hint) {
		color: var(--muted);
		font-size: var(--text-md);
	}
</style>
