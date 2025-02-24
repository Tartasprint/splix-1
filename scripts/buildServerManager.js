import { resolve } from "jsr:@std/path";
import { buildExecutable } from "../shared/buildExecutable.js";
import { setCwd } from "./chdir_anywhere.js";
setCwd();
Deno.chdir("..");

await buildExecutable({
	outputDir: resolve("serverManager/out"),
	outputFileName: "serverManager",
	entryPoint: resolve("serverManager/main.js"),
	permissionFlags: [
		"--allow-net",
		"--allow-read",
		"--allow-write",
		"--allow-env",
	],
});
