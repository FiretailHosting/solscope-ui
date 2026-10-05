// Compiles .svelte files for the server when a test imports one, with the
// Svelte compiler the library already builds with, so a test can render a
// component to HTML and check its markup without a browser.
import { plugin } from 'bun';
import { compile, compileModule } from 'svelte/compiler';

plugin({
	name: 'svelte-server',
	setup(build) {
		build.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
			const source = await Bun.file(path).text();
			const { js } = compile(source, { filename: path, generate: 'server', css: 'external' });
			return { contents: js.code, loader: 'js' };
		});
		// Modules that use runes, as LayerChart's do.
		build.onLoad({ filter: /\.svelte\.js$/ }, async ({ path }) => {
			const source = await Bun.file(path).text();
			const { js } = compileModule(source, { filename: path, generate: 'server' });
			return { contents: js.code, loader: 'js' };
		});
	}
});
