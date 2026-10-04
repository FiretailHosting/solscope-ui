// Dates as the charts read them, kept apart from the chart placement code so
// pages can show them without loading it.
/** spansYears says the points start and end in different years, so dates need the year. */
export function spansYears(points) {
    return points.length > 1 && new Date(points[0].t).getFullYear() !== new Date(points[points.length - 1].t).getFullYear();
}
/**
 * chartTime is a moment on the chart, "Sep 25, 5:21 AM", with the year only
 * when needed. Date and time are joined here, as some engines put "at"
 * between them.
 */
export function chartTime(t, withYear) {
    const time = new Date(t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return `${chartDay(t, withYear)}, ${time}`;
}
/** chartDay is a day on the chart, "Sep 24", with the year only when needed. */
export function chartDay(t, withYear) {
    return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(withYear ? { year: 'numeric' } : {}) });
}
/**
 * axisTime is a tick label along the time axis: the time of day within one
 * day, the day and hour over a few days, the day otherwise, and the month
 * and year across years.
 */
export function axisTime(t, spanMs, withYear) {
    const date = new Date(t);
    const hour = 3_600_000;
    if (spanMs <= 36 * hour)
        return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    if (spanMs <= 4 * 24 * hour)
        return `${chartDay(t, false)}, ${date.toLocaleTimeString(undefined, { hour: 'numeric' })}`;
    if (withYear)
        return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    return chartDay(t, false);
}
