import { defineConfig } from "tsup";
import { copyFileSync } from "fs";

export default defineConfig({
	entry: ["src/index.ts", "src/simple-server.ts"],
	format: ["esm"],
	target: "esnext",
	sourcemap: true,
	clean: true,
	dts: true,
	splitting: false,
	banner: {
		js: "// Generated with tsup\n// https://github.com/egoist/tsup",
	},
	outDir: "dist",
	bundle: true,
	external: ["express"], // Don't bundle express
	onSuccess: async () => {
		// Copy swagger.html to dist folder
		try {
			copyFileSync("src/swagger.html", "dist/swagger.html");
			console.log("✅ swagger.html copied to dist/");
		} catch (error) {
			console.error("⚠️ Failed to copy swagger.html:", error);
		}
	},
});
