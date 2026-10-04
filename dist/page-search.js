function words(text) {
    return text.toLocaleLowerCase().split(/\s+/).filter(Boolean);
}
// Every word typed must start a word of the page's label or section, so
// "port" finds Portfolio, "ad cr" finds the admin Credits and "o" does not
// find every page with an o in it. Pages whose label starts with the first
// word come first; otherwise the given order, the sidebar's, stands.
export function filterPages(pages, query) {
    const typed = words(query);
    if (!typed.length)
        return [...pages];
    const starts = [];
    const others = [];
    for (const page of pages) {
        const labelWords = words(page.label);
        const pageWords = [...labelWords, ...words(page.section ?? '')];
        if (!typed.every((word) => pageWords.some((pageWord) => pageWord.startsWith(word))))
            continue;
        (labelWords[0]?.startsWith(typed[0]) ? starts : others).push(page);
    }
    return [...starts, ...others];
}
/** "1 page", "3 pages" or "no pages". */
export function countPhrase(count, [one, other]) {
    if (count === 0)
        return `no ${other}`;
    return `${count} ${count === 1 ? one : other}`;
}
// The count read out for every section together, such as "3 pages, 5 coins".
// Closed sections are left out. It waits, as an empty string, while any
// open section loads, so the read-out comes once with every count rather
// than once per section. A failed section says its error instead of a
// count, lowercased to read as part of the sentence: "3 pages, could not
// search coins".
export function searchSummary(parts) {
    const open = parts.filter((part) => !part.closed);
    if (open.some((part) => part.loading))
        return '';
    return open
        .map((part) => (part.error ? inSentence(part.error) : countPhrase(part.count, part.noun)))
        .join(', ');
}
function inSentence(text) {
    const trimmed = text.trim().replace(/\.$/, '');
    return trimmed.charAt(0).toLocaleLowerCase() + trimmed.slice(1);
}
