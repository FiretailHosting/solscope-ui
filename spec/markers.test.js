import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { avatarStatus, loadAvatar, settleAvatar } from '../src/lib/chart/avatars.ts';
import {
	clusterKey,
	clusterLabel,
	clusterMarkers,
	clusterSide,
	initials,
	MARKER_CLUSTER_DISTANCE,
	markerFace,
	markerLabel
} from '../src/lib/chart/markers.ts';

const start = Date.parse('2026-09-01T00:00:00Z');
const formatTime = (t) => `T${(t - start) / 60_000}`;
const at = (minutes, left, top, extra = {}) => ({ t: start + minutes * 60_000, price: 1, side: 'buy', title: `trade ${minutes}`, left, top, ...extra });

test('markers far apart stay apart, and close ones group in time order', () => {
	const clusters = clusterMarkers([at(2, 10, 10), at(1, 100, 10), at(3, 15, 12), at(4, 200, 50)]);
	assert.deepEqual(
		clusters.map((cluster) => cluster.members.map((member) => member.title)),
		[['trade 1'], ['trade 2', 'trade 3'], ['trade 4']]
	);
	// A group sits where its first trade does.
	assert.deepEqual([clusters[1].left, clusters[1].top], [10, 10]);
});

test('a marker joins a group only within the distance of its spot, so groups never chain across the plot', () => {
	const row = Array.from({ length: 10 }, (_, index) => at(index, index * 20, 0));
	const clusters = clusterMarkers(row, 24);
	// Each group holds a marker and the one 20px on, never a third 40px from its spot.
	assert.ok(clusters.every((cluster) => cluster.members.length <= 2));
	assert.equal(clusters.reduce((sum, cluster) => sum + cluster.members.length, 0), 10);
	for (const cluster of clusters) {
		for (const member of cluster.members) assert.ok(Math.hypot(member.left - cluster.left, member.top - cluster.top) < 24);
	}
});

test('group spots are at least the distance apart, and the default is the 24px target with room for its count', () => {
	assert.ok(MARKER_CLUSTER_DISTANCE >= 24);
	const scattered = Array.from({ length: 500 }, (_, index) => at(index, (index * 37) % 800, (index * 53) % 220));
	const clusters = clusterMarkers(scattered);
	assert.equal(clusters.reduce((sum, cluster) => sum + cluster.members.length, 0), 500);
	for (let a = 0; a < clusters.length; a++) {
		for (let b = a + 1; b < clusters.length; b++) {
			assert.ok(Math.hypot(clusters[a].left - clusters[b].left, clusters[a].top - clusters[b].top) >= MARKER_CLUSTER_DISTANCE);
		}
	}
});

test('500 markers group quickly', () => {
	const many = Array.from({ length: 500 }, (_, index) => at(index, Math.random() * 1000, Math.random() * 260));
	const begun = performance.now();
	for (let round = 0; round < 20; round++) clusterMarkers(many);
	assert.ok((performance.now() - begun) / 20 < 20, 'under 20ms a layout');
});

test('a group is a buy, a sell or mixed', () => {
	assert.equal(clusterSide([at(1, 0, 0), at(2, 0, 0)]), 'buy');
	assert.equal(clusterSide([at(1, 0, 0, { side: 'sell' })]), 'sell');
	assert.equal(clusterSide([at(1, 0, 0), at(2, 0, 0, { side: 'sell' })]), 'mixed');
});

test('one trade is named as the readout shows it, a few are listed, and many are counted', () => {
	const note = { text: '+8% vs your buy', up: true };
	assert.equal(markerLabel(at(1, 0, 0, { note }), formatTime, false), 'trade 1, T1, +8% vs your buy');
	assert.equal(clusterLabel([at(1, 0, 0)], formatTime, false), 'trade 1, T1');
	assert.equal(clusterLabel([at(1, 0, 0), at(2, 0, 0)], formatTime, false), '2 trades: trade 1, T1; trade 2, T2');
	const many = [at(1, 0, 0), at(2, 0, 0, { side: 'sell' }), at(3, 0, 0), at(4, 0, 0)];
	assert.equal(clusterLabel(many, formatTime, false), '4 trades from T1 to T4: 3 buys, 1 sell');
	assert.equal(clusterLabel(many.filter((member) => member.side === 'buy').concat(at(5, 0, 0)), formatTime, false), '4 trades from T1 to T5: 4 buys');
});

test('a group key names its trades, so a pick survives a re-layout that keeps it whole', () => {
	assert.equal(clusterKey([at(1, 0, 0), at(2, 5, 5)]), clusterKey([at(1, 9, 9), at(2, 1, 1)]));
	assert.notEqual(clusterKey([at(1, 0, 0)]), clusterKey([at(1, 0, 0), at(2, 0, 0)]));
});

test('initials take the first letter of the first two words', () => {
	assert.equal(initials('Maya Lopez'), 'ML');
	assert.equal(initials('momentum-bot'), 'MB');
	assert.equal(initials('  theo  '), 'T');
	assert.equal(initials('Ana María José'), 'AM');
	assert.equal(initials('Émile zola'), 'ÉZ');
	assert.equal(initials(''), '');
	assert.equal(initials(undefined), '');
});

test('a marker shows its picture once loaded, else initials, else the buy or sell shape', () => {
	const marker = { avatar: '/a.png', name: 'Maya Lopez' };
	assert.deepEqual(markerFace(marker, 'loaded'), { kind: 'image', src: '/a.png' });
	assert.deepEqual(markerFace(marker, 'pending'), { kind: 'initials', text: 'ML' });
	assert.deepEqual(markerFace(marker, 'failed'), { kind: 'initials', text: 'ML' });
	assert.deepEqual(markerFace(marker, undefined), { kind: 'initials', text: 'ML' });
	assert.deepEqual(markerFace({ avatar: '/a.png' }, 'failed'), { kind: 'shape' });
	assert.deepEqual(markerFace({}, undefined), { kind: 'shape' });
	assert.deepEqual(markerFace({ name: '   ' }, undefined), { kind: 'shape' });
});

test('a picture settles once and tells every chart waiting on it', () => {
	const url = `/avatar-${Math.random()}.png`;
	assert.equal(avatarStatus(url), undefined);
	// Without a browser nothing loads, and nothing waits.
	let called = 0;
	assert.equal(loadAvatar(url, () => called++), 'pending');
	settleAvatar(url, 'failed');
	assert.equal(called, 0);
	assert.equal(avatarStatus(url), 'failed');
	// Settled pictures answer at once, without a callback or a second fetch.
	assert.equal(loadAvatar(url, () => called++), 'failed');
	assert.equal(called, 0);
});

test('with a browser, a picture is fetched once for every chart that asks', async () => {
	const created = [];
	const realImage = globalThis.Image;
	globalThis.Image = class {
		constructor() {
			created.push(this);
		}
		decode() {
			return Promise.resolve();
		}
	};
	try {
		const url = `/avatar-${Math.random()}.png`;
		let settled = 0;
		assert.equal(loadAvatar(url, () => settled++), 'pending');
		assert.equal(loadAvatar(url, () => settled++), 'pending');
		assert.equal(created.length, 1);
		assert.equal(created[0].src, url);
		await Promise.resolve();
		await Promise.resolve();
		assert.equal(settled, 2);
		assert.equal(loadAvatar(url, () => settled++), 'loaded');
		assert.equal(created.length, 1);
	} finally {
		globalThis.Image = realImage;
	}
});
