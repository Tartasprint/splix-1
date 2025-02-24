import { rollup } from "$rollup";
import { terser } from "../shared/rollup-terser-plugin.js";
import alias from "$rollup-plugin-alias";
import * as path from "jsr:@std/path";
import { copy, ensureDir } from "jsr:@std/fs";
import * as streams from "jsr:@std/streams";
import { Tar } from "jsr:@std/archive";
import { setCwd } from "./chdir_anywhere.js";
import { tar_dir } from "./tar.js";
setCwd();

Deno.chdir("../adminPanel");

const outDir = path.resolve("./out");
const distDir = path.resolve(outDir, "./dist");

try {
	await Deno.remove(outDir, { recursive: true });
} catch {
	// Already removed
}
await ensureDir(distDir);

const bundle = await rollup({
	input: "src/main.js",
	onwarn: (message) => {
		if (message.code == "CIRCULAR_DEPENDENCY") return;
		console.error(message.message);
	},
	plugins: [
		alias({
			entries: [
				{
					find: "renda",
					replacement:
						"../deps/raw.githubusercontent.com/rendajs/Renda/705c5a01bc4d3ca4a282fff1a7a8567d1be7ce04/mod.js",
				},
			],
		}),
	],
});
const { output } = await bundle.write({
	dir: path.resolve(distDir, "bundle"),
	format: "esm",
	entryFileNames: "[name]-[hash].js",
	plugins: [
		terser(),
	],
});

const originalBundleEntryPoint = path.resolve("src/main.js");

let bundleEntryPoint = null;
for (const chunk of output) {
	if (chunk.type == "chunk") {
		if (chunk.facadeModuleId == originalBundleEntryPoint) {
			bundleEntryPoint = chunk.fileName;
		}
	}
}
if (!bundleEntryPoint) {
	throw new Error("Assertion failed, unable to find main entry point in generated bundle.");
}

let indexContent = await Deno.readTextFile("index.html");
indexContent = indexContent.replace("./src/main.js", "./bundle/" + bundleEntryPoint);
await Deno.writeTextFile(path.resolve(distDir, "index.html"), indexContent);
await copy("style.css", path.resolve(distDir, "style.css"));

// Archive all files
tar_dir(distDir,"./out/adminPanel.tar")
