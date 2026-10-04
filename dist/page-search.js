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
