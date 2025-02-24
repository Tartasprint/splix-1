import { rollup } from "$rollup";
import replace from "$rollup-plugin-replace";
import { terser } from "../shared/rollup-terser-plugin.js";
import { resolve } from "jsr:@std/path";
import { copy, ensureDir } from "jsr:@std/fs";
import * as streams from "jsr:@std/streams";
import * as path from "jsr:@std/path";
import * as fs from "jsr:@std/fs";
import { TarStream } from "jsr:@std/tar";
import { setCwd } from "./chdir_anywhere.js";
import { tar_dir } from "./tar.js";
setCwd();

Deno.chdir("../client");

const versionArg = Deno.args[0] || "0.0.0";

const outDir = resolve("./out");
const distDir = resolve(outDir, "./dist");

try {
	await Deno.remove(outDir, { recursive: true });
} catch {
	// Already removed
}
await ensureDir(distDir);

const bundle = await rollup({
	input: [
		"src/main.js",
		"src/leaderboards.js",
	],
	onwarn: (message) => {
		if (message.code == "CIRCULAR_DEPENDENCY") return;
		console.error(message.message);
	},
	plugins: [
		replace({
			values: {
				IS_DEV_BUILD: JSON.stringify(false),
				CLIENT_VERSION: JSON.stringify(versionArg),
			},
			preventAssignment: true,
		}),
	],
});
const { output } = await bundle.write({
	dir: resolve(distDir, "bundle"),
	format: "esm",
	entryFileNames: "[name]-[hash].js",
	plugins: [
		terser({
			module: true,
		}),
	],
});

const originalBundleEntryPoint = path.resolve("src/main.js");
const leaderboardsBundleEntryPoint = path.resolve("src/leaderboards.js");

let mainEntryPoint = null;
let leaderboardsEntryPoint = null;
for (const chunk of output) {
	if (chunk.type == "chunk") {
		if (chunk.facadeModuleId == originalBundleEntryPoint) {
			mainEntryPoint = chunk.fileName;
		} else if (chunk.facadeModuleId == leaderboardsBundleEntryPoint) {
			leaderboardsEntryPoint = chunk.fileName;
		}
	}
}
if (!mainEntryPoint) {
	throw new Error("Assertion failed, unable to find main entry point in generated bundle.");
}
if (!leaderboardsEntryPoint) {
	throw new Error("Assertion failed, unable to find leaderboards entry point in generated bundle.");
}

let indexContent = await Deno.readTextFile("index.html");
indexContent = indexContent.replace("./src/main.js", "./bundle/" + mainEntryPoint);
await Deno.writeTextFile(resolve(distDir, "index.html"), indexContent);

let leaderboardsContent = await Deno.readTextFile("leaderboards.html");
leaderboardsContent = leaderboardsContent.replace("./src/leaderboards.js", "./bundle/" + leaderboardsEntryPoint);
await Deno.writeTextFile(resolve(distDir, "leaderboards.html"), leaderboardsContent);

await copy("about.html", resolve(distDir, "about.html"));
await copy("flags.html", resolve(distDir, "flags.html"));
await copy("privacy.html", resolve(distDir, "privacy.html"));
await copy("static", resolve(distDir, "static"));
await copy("json", resolve(distDir, "json")); // Legacy

// Archive all files
tar_dir(distDir,"./out/client.tar")
