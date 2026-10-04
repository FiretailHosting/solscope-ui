import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { closesSheet, isSheetSwipe } from '../src/lib/sheet-swipe.ts';

test('a small move is not told apart yet', () => {
	assert.equal(isSheetSwipe(0, 0), null);
	assert.equal(isSheetSwipe(6, 8), null);
});

test('a clear move down is a swipe', () => {
	assert.equal(isSheetSwipe(0, 20), true);
	assert.equal(isSheetSwipe(10, 30), true);
});

test('up, sideways and diagonal moves are not', () => {
	assert.equal(isSheetSwipe(0, -20), false);
	assert.equal(isSheetSwipe(40, 5), false);
	assert.equal(isSheetSwipe(20, 25), false);
});

test('a quick flick down closes however short', () => {
	assert.equal(closesSheet(20, 0.8, 600), true);
});

test('a slow pull closes past a quarter of the sheet', () => {
	assert.equal(closesSheet(99, 0.1, 400), false);
	assert.equal(closesSheet(100, 0.1, 400), true);
});

test('a tall sheet closes after a capped pull', () => {
	assert.equal(closesSheet(160, 0.1, 2000), true);
	assert.equal(closesSheet(150, 0.1, 2000), false);
});

test('a pull back up never closes', () => {
	assert.equal(closesSheet(0, 1, 400), false);
	assert.equal(closesSheet(-30, 1, 400), false);
});
