import { serveDir } from "jsr:@std/http/file-server";
import { resolve } from "jsr:@std/path";
import { setCwd } from "./chdir_anywhere.js";
import { init as initGameServer } from "../gameServer/src/mainInstance.js";
import { init as initServerManager } from "../serverManager/src/mainInstance.js";
import "jsr:@std/dotenv/load";
import { INSECURE_LOCALHOST_SERVERMANAGER_TOKEN } from "../shared/config.js";
setCwd();

Deno.chdir("..");

if (!Deno.args.includes("--no-init")) {
	const gameServer = initGameServer({
		arenaWidth: 40,
		arenaHeight: 40,
	});

	const persistentStoragePath = resolve("serverManager/persistentStorage.json");
	const serverManager = initServerManager({
		persistentStoragePath,
		websocketAuthToken: INSECURE_LOCALHOST_SERVERMANAGER_TOKEN,
	});

	/** Directories that should be served using serveDir() */
	const serveRootDirs = [
		"adminpanel",
		"shared",
		"deps",
		"client",
	];

	Deno.serve({
		port: 8080,
	}, async (request, remoteAddr) => {
		const url = new URL(request.url);
		if (url.pathname == "/") {
			return new Response(
				`
				<!DOCTYPE html>
				<html>
					<head>
						<style>
							* {
								font-family: Arial, Helvetica, sans-serif;
							}
						</style>
					</head>
					<body>
						<h1>Local Splix server</h1>
						<p>Available endpoints:
							<ul>
								<li><a href="/client/">/client/</a> - The splix client.</li>
								<li><a href="/client/flags.html">/client/flags.html</a> - Client flags for debugging etc.</li>
								<li>/gameserver - The gameserver, <a href="/client/#ip=ws://localhost:8080/gameserver">click here to connect to it using a client</a></li>
								<li><a href="/adminpanel/">/adminpanel/</a> - Admin panel for server management.</li>
								<li>/servermanager/ - Hosts several endpoints for servermanagement.</li>
								<li><a href="/servermanager/gameservers">/servermanager/gameservers</a> - Endpoint which can be used by clients to list available servers.</li>
							</ul>
						</p>
					</body>
				</html>
			`,
				{
					headers: {
						"Content-Type": "text/html",
					},
				},
			);
		} else if (url.pathname == "/gameserver") {
			return gameServer.websocketManager.handleRequest(request, remoteAddr.remoteAddr);
		} else if (url.pathname.startsWith("/servermanagerToken")) {
			return new Response(INSECURE_LOCALHOST_SERVERMANAGER_TOKEN);
		} else if (url.pathname.startsWith("/servermanager")) {
			return serverManager.websocketManager.handleRequest(request, remoteAddr.remoteAddr);
		}

		for (const dir of serveRootDirs) {
			if (url.pathname.startsWith(`/${dir}/`)) {
				return await serveDir(request, {
					quiet: true,
					showDirListing: true,
				});
			}
		}
		return new Response("not found", { status: 404 });
	});
}
