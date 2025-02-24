import { resolve } from "jsr:@std/path";
import { buildExecutable } from "../shared/buildExecutable.js";
import { setCwd } from "./chdir_anywhere.js";
setCwd();
Deno.chdir("..");

await buildExecutable({
	outputDir: resolve("gameServer/out"),
	outputFileName: "splixGameServer",
	entryPoint: resolve("gameServer/src/mainInstance.js"),
	permissionFlags: [
		"--allow-net",
		"--allow-read",
	],
	include: [
		resolve("gameServer/src/gameplay/arenaWorker/mod.js"),
	],
});
