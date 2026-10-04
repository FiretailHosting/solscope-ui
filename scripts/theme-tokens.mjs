// Writes src/lib/theme-tokens.ts from tokens.css: every custom property of
// the light theme, and the dark theme over it, as plain strings. An app reads
// them where CSS cannot reach: the theme-color metas, the launch screen, a
// manifest, an offline page. Run by `bun run package`; `--check` fails when
// the file is stale, for `bun run check`.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const lib = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'lib');
const css = readFileSync(join(lib, 'tokens.css'), 'utf8');
const target = join(lib, 'theme-tokens.ts');

/** The custom properties declared in the first block that opens with `selector {`. */
function block(selector) {
	const start = css.indexOf(`${selector} {`);
	if (start < 0) throw new Error(`tokens.css has no "${selector}" block`);
	const body = css.slice(start, css.indexOf('\n}', start));
	const tokens = {};
	for (const match of body.matchAll(/^\s*--([a-z0-9-]+):\s*([^;]+);/gm)) tokens[match[1]] = match[2].trim();
	return tokens;
}

const light = block(':root');
const dark = { ...light, ...block(":root[data-theme='dark']") };
const literal = (tokens) =>
	'{\n' +
	Object.entries(tokens)
		.map(([name, value]) => `\t\t'${name}': ${JSON.stringify(value)}`)
		.join(',\n') +
	'\n\t}';

const source = `// Generated from tokens.css by scripts/theme-tokens.mjs. Do not edit.

/** Every token of tokens.css as a string, by name without the leading dashes, per theme. */
export const themeTokens = {
	light: ${literal(light)},
	dark: ${literal(dark)}
} as const;

export type ThemeTokenName = keyof typeof themeTokens.light;
`;

if (process.argv.includes('--check')) {
	let current = '';
	try {
		current = readFileSync(target, 'utf8');
	} catch {}
	if (current !== source) {
		console.error('src/lib/theme-tokens.ts is out of date with tokens.css; run `bun run tokens`.');
		process.exit(1);
	}
} else {
	writeFileSync(target, source);
	console.log(`wrote ${target}`);
}
