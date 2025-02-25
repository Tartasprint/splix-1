/**
 * @typedef {{stop:(...args: any)=>void}} Animation
 */

/**
 * @type {Map<number,Animation>}
 */
export const running = new Map();

let next_id = 0;
const MAX_ANIMATIONS = 1000;
const get_new_id = () => {
	let id;
	if (running.has(next_id)) {
		if (running.size < MAX_ANIMATIONS) {
			for (
				id = (next_id + 1) % MAX_ANIMATIONS;
				running.has(id) && id !== next_id;
				id = (id + 1) % MAX_ANIMATIONS
			) {
				// all the work is done in the parameters of the `for` loop
			}
			if (!running.has(id)) {
				next_id = (id + 1) % MAX_ANIMATIONS;
				return id;
			}
		}
		throw new Error("Max animations reached.");
	}
	id = next_id;
	next_id = (id + 1) % MAX_ANIMATIONS;
	return id;
};

/**
 * @param {*} fillRect
 * @param {number} x the x position of the block
 * @param {number} y the y position of the block
 * @param {number} on the first state
 * @param {number} off the second state
 * @param {number} frequency the frequency in milliseconds at which the state is changed.
 */
export const blink_block = (fillRect, x, y, on, off, frequency) => {
	const id = get_new_id();
	let toggle = true;
	const reference = setInterval(() => {
		if (toggle) {
			fillRect({
				min: {
					x,
					y,
				},
				max: {
					x: x + 1,
					y: y + 1,
				},
			}, on);
		} else {
			fillRect({
				min: {
					x,
					y,
				},
				max: {
					x: x + 1,
					y: y + 1,
				},
			}, off);
		}
		toggle = !toggle;
	}, frequency);
	running.set(id, {
		stop: () => {
			clearInterval(reference);
		},
	});
	return id;
};

/**
 * @param {*} fillRect
 * @param {*} messenger
 * @param {number} x the x position of the block
 * @param {number} y the y position of the block
 * @param {number} player_id the id of the player
 * @param {number} time_in time in milliseconds before the rectangle starts filling.
 * @param {number} interval time between each layer of the filling process.
 * @param {number} time_out time in milliseconds after the rectangle is filled.
 */
export const filling_spawn = (fillRect, messenger, x, y, player_id, time_in, interval, time_out) => {
	const id = get_new_id();
	const current_ref = { v: -1 };
	current_ref.v = setTimeout(() => {
		fillRect({ min: { x: x - 1, y: y + 4 }, max: { x: x + 2, y: y + 5 } }, 0);
		console.log("filling_spawn: starting to fill.");
		let radius = -1;
		current_ref.v = setInterval(() => {
			if (radius < 4) {
				console.log("filling_spawn: Round.");
				radius += 1;
				fillRect({
					min: {
						x: x - radius,
						y: y - radius,
					},
					max: {
						x: x + radius + 1,
						y: y + radius + 1,
					},
				}, -1);
			} else {
				console.log("filling_spawn: Filled.");
				clearInterval(current_ref.v);
				current_ref.v = setTimeout(() => {
					console.log("filling_spawn: Cleared.");
					radius -= 1;
					fillRect(
						{ min: { x: x - radius, y: y - radius }, max: { x: x + radius + 1, y: y + radius + 1 } },
						0,
					);
					messenger.send.fill_spawn_finished(player_id);
				}, time_out);
			}
		}, interval);
	}, time_in);
	running.set(id, {
		stop: (messenger) => {
			clearInterval(current_ref.v);
			fillRect({ min: { x: x - 3, y: y - 3 }, max: { x: x + 3 + 1, y: y + 3 + 1 } }, 0);
			fillRect({ min: { x: x - 1, y: y + 4 }, max: { x: x + 2, y: y + 5 } }, -1);
			messenger.send.fill_spawn_finished(player_id);
		},
	});
	return id;
};
