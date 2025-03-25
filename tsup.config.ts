import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	target: "node18",
	sourcemap: true,
	clean: true,
	dts: true,
	splitting: false,
	outDir: "dist",
	// Explicitly handle .js extensions in imports
	esbuildOptions(options) {
		options.banner = {
			js: "// Generated with tsup\n// https://github.com/egoist/tsup",
		};
		options.platform = "node";
		options.format = "esm";
	},
});
