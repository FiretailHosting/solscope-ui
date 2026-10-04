import type { IconName } from './icons/icons.js';

export type PageSearchItem = {
	href: string;
	label: string;
	icon: IconName;
	/** The group the page sits in, such as a sidebar section; shown beside it and searched too. */
	section?: string;
	/**
	 * Marks the page shown, as TabBar items do: `true` or `'page'` for that
	 * exact page, `'section'` when the page shown lives under it, such as one
	 * market under Markets.
	 */
	active?: boolean | 'page' | 'section';
	/** An unread count, shown beside the page and read out. */
	badge?: number;
};

function words(text: string): string[] {
	return text.toLocaleLowerCase().split(/\s+/).filter(Boolean);
}

// Every word typed must start a word of the page's label or section, so
// "port" finds Portfolio, "ad cr" finds the admin Credits and "o" does not
// find every page with an o in it. Pages whose label starts with the first
// word come first; otherwise the given order, the sidebar's, stands.
export function filterPages<Page extends PageSearchItem>(pages: readonly Page[], query: string): Page[] {
	const typed = words(query);
	if (!typed.length) return [...pages];
	const starts: Page[] = [];
	const others: Page[] = [];
	for (const page of pages) {
		const labelWords = words(page.label);
		const pageWords = [...labelWords, ...words(page.section ?? '')];
		if (!typed.every((word) => pageWords.some((pageWord) => pageWord.startsWith(word)))) continue;
		(labelWords[0]?.startsWith(typed[0]) ? starts : others).push(page);
	}
	return [...starts, ...others];
}

/** One result of a section the app searches itself, such as coins. */
export type PageSearchResult = {
	href: string;
	label: string;
	/** Smaller text after the label, such as a symbol. */
	detail?: string;
	/** Shown at the end of the row, such as a price. */
	value?: string;
	/** Read out before the value, such as "Price". */
	valueLabel?: string;
	/** A small round image before the label, such as a token icon; an empty circle keeps the rows aligned without one. */
	image?: string;
};

/** A result section under the pages, which the app fills as `query` changes. */
export type PageSearchSection = {
	/** Unique and stable: a closed section stays closed by it. */
	id: string;
	title: string;
	results: PageSearchResult[];
	/** Results are on their way: skeleton rows show and the count waits. */
	loading?: boolean;
	/** Fixed text shown instead of results when the search failed; never a raw server error. */
	error?: string;
	/** Shown when there are no results; the sheet's `noMatchesText` otherwise. */
	emptyText?: string;
	/** Singular and plural for the count read out, such as ['coin', 'coins']. */
	noun?: [string, string];
};

/** What the count read-out needs to know about a section. */
export type PageSearchSummaryPart = {
	count: number;
	noun: [string, string];
	loading?: boolean;
	error?: string;
};

/** "1 page", "3 pages" or "no pages". */
export function countPhrase(count: number, [one, other]: [string, string]): string {
	if (count === 0) return `no ${other}`;
	return `${count} ${count === 1 ? one : other}`;
}

// The count read out for every section together, such as "3 pages, 5 coins".
// It waits, as an empty string, while any section loads, so the read-out
// comes once with every count rather than once per section. A failed
// section says its error instead of a count.
export function searchSummary(parts: readonly PageSearchSummaryPart[]): string {
	if (parts.some((part) => part.loading)) return '';
	return parts.map((part) => part.error || countPhrase(part.count, part.noun)).join(', ');
}
