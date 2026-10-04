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
