import { dirname, fromFileUrl } from "https://deno.land/std@0.153.0/path/mod.ts";

/**
 * Changes the current working directory to the folder that contains the main
 * entry point of your script.
 * @param {string} importMeta Optionally provide an import.meta.url if you want
 * to change to a directory to that of a script that is not the main entry point.
 */
export function setCwd(importMeta = Deno.mainModule) {
	Deno.chdir(getScriptDir(importMeta));
}

/**
 * Gets the path to the directory that contains the main module of your script.
 * @param {string} importMeta Optionally provide an import.meta.url if you want
 * to change to a directory to that of a script that is not the main entry point.
 */
export function getScriptDir(importMeta = Deno.mainModule) {
	return dirname(fromFileUrl(importMeta));
}
