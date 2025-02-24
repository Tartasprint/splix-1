import { ApplicationLoop } from "./ApplicationLoop.js";
import { Game } from "./gameplay/Game.js";
import { WebSocketManager } from "./WebSocketManager.js";
import { Vec2 } from "../../renda/mod.js";

export class Main {
	/**
	 * @param {Object} options
	 * @param {number} options.arenaWidth
	 * @param {number} options.arenaHeight
	 * @param {string} options.walls
	 * @param {import("./gameplay/Game.js").GameModes} [options.gameMode]
	 */
	constructor({
		arenaWidth,
		arenaHeight,
		walls,
		gameMode = "default",
	}) {
		let y = 0;
		let w = [];
		let spawns = [];
		for(const line of walls.split('\n')){
			let l = []
			let x = 0;
			for(const char of line){
				l.push(char === '#');
				if(char.toUpperCase() === 'X'){
					spawns.push({p: new Vec2(x,y), occupied: false});
				}
				x+=1;
			}
			y+=1;
			w.push(l)
		}
		this.applicationLoop = new ApplicationLoop();
		this.websocketManager = new WebSocketManager();
		this.game = new Game(this.applicationLoop, {
			arenaWidth,
			arenaHeight,
			walls: w,
			spawns: spawns.length > 0 ? spawns:null,
			gameMode,
		});
		this.game.onPlayerCountChange((playerCount) => {
			this.websocketManager.notifyControlSocketsPlayerCount(playerCount);
		});
		this.game.onPlayerScoreReported((score) => {
			this.websocketManager.notifyControlSocketsPlayerScore(score);
		});
	}

	/**
	 * @param {Object} options
	 * @param {number} options.port
	 * @param {string} options.hostname
	 */
	init({ port, hostname }) {
		this.websocketManager.startServer(port, hostname);
	}
}
