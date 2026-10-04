import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { countPhrase, filterPages, searchSummary } from '../src/lib/page-search.ts';

const pages = [
	{ href: '/', label: 'Dashboard', icon: 'dashboard', section: 'Overview' },
	{ href: '/markets', label: 'Markets', icon: 'markets', section: 'Overview' },
	{ href: '/portfolio', label: 'Portfolio', icon: 'portfolio', section: 'Trading' },
	{ href: '/orders', label: 'Orders', icon: 'orders', section: 'Trading' },
	{ href: '/credits', label: 'Credits', icon: 'spark', section: 'Automation' },
	{ href: '/admin/credits', label: 'Credits', icon: 'spark', section: 'Admin' },
	{ href: '/admin/models', label: 'AI models', icon: 'spark', section: 'Admin' }
];
const hrefs = (list) => list.map((page) => page.href);

test('nothing typed offers every page in the given order', () => {
	assert.deepEqual(hrefs(filterPages(pages, '')), hrefs(pages));
	assert.deepEqual(hrefs(filterPages(pages, '   ')), hrefs(pages));
});

test('a word matches the start of a label word, ignoring case', () => {
	assert.deepEqual(hrefs(filterPages(pages, 'PORT')), ['/portfolio']);
	assert.deepEqual(hrefs(filterPages(pages, 'mod')), ['/admin/models']);
	// Not anywhere inside a word: "o" is not every page with an o.
	assert.deepEqual(hrefs(filterPages(pages, 'o')), ['/orders', '/', '/markets']);
});

test('the section is searched too, and every word must match', () => {
	assert.deepEqual(hrefs(filterPages(pages, 'admin')), ['/admin/credits', '/admin/models']);
	assert.deepEqual(hrefs(filterPages(pages, 'ad cr')), ['/admin/credits']);
	assert.deepEqual(hrefs(filterPages(pages, 'trading xyz')), []);
});

test('pages whose label starts with the first word come first', () => {
	assert.deepEqual(hrefs(filterPages(pages, 'tr')), ['/portfolio', '/orders']);
	assert.deepEqual(hrefs(filterPages(pages, 'a')), ['/admin/models', '/credits', '/admin/credits']);
});

test('no match gives an empty list', () => {
	assert.deepEqual(filterPages(pages, 'zzz'), []);
});

test('a count reads as none, one or many', () => {
	assert.equal(countPhrase(0, ['coin', 'coins']), 'no coins');
	assert.equal(countPhrase(1, ['coin', 'coins']), '1 coin');
	assert.equal(countPhrase(5, ['coin', 'coins']), '5 coins');
});

test('the summary covers every section, waits while one loads and says errors', () => {
	const pagesPart = { count: 3, noun: ['page', 'pages'] };
	assert.equal(searchSummary([pagesPart, { count: 5, noun: ['coin', 'coins'] }]), '3 pages, 5 coins');
	assert.equal(searchSummary([{ ...pagesPart, count: 0 }, { count: 0, noun: ['coin', 'coins'] }]), 'no pages, no coins');
	assert.equal(searchSummary([pagesPart, { count: 0, noun: ['coin', 'coins'], loading: true }]), '');
	assert.equal(
		searchSummary([pagesPart, { count: 0, noun: ['coin', 'coins'], error: 'Could not search coins.' }]),
		'3 pages, Could not search coins.'
	);
	assert.equal(searchSummary([pagesPart]), '3 pages');
});
