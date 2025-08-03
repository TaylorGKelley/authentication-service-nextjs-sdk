import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs', 'esm'],
	dts: true,
	outDir: 'dist',
	clean: true,
	treeshake: true,
	target: 'es2020',
	external: ['react', 'react-dom', 'next'],
	esbuildOptions(options) {
		options.banner = {
			js: '"use client";',
		};
	},
});
