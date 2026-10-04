/** spansYears says the points start and end in different years, so dates need the year. */
export declare function spansYears(points: {
    t: number;
}[]): boolean;
/**
 * chartTime is a moment on the chart, "Sep 25, 5:21 AM", with the year only
 * when needed. Date and time are joined here, as some engines put "at"
 * between them.
 */
export declare function chartTime(t: number, withYear: boolean): string;
/** chartDay is a day on the chart, "Sep 24", with the year only when needed. */
export declare function chartDay(t: number, withYear: boolean): string;
/**
 * axisTime is a tick label along the time axis: the time of day within one
 * day, the day and hour over a few days, the day otherwise, and the month
 * and year across years.
 */
export declare function axisTime(t: number, spanMs: number, withYear: boolean): string;
