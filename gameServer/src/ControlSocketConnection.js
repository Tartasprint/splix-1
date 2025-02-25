import { TypedMessenger } from "../../renda/mod.js";

function createResponseHandlers() {
	return {};
}

/** @typedef {ReturnType<typeof createResponseHandlers>} ControlSocketResponseHandlers */

export class ControlSocketConnection {
	/** @type {TypedMessenger<ControlSocketResponseHandlers, import("../../serverManager/src/GameServer.js").ServerManagerResponseHandlers>} */
	#messenger = new TypedMessenger();

	get messenger() {
		return this.#messenger;
	}

	/**
	 * @param {import('./WebSocketConnection.js').WebSocketConnection} connection
	 */
	constructor(connection) {
		this.#messenger.setSendHandler((data) => {
			connection.send(JSON.stringify(data.sendData));
		});
		this.#messenger.setResponseHandlers(createResponseHandlers());
	}

	/**
	 * @param {import("../../renda/TypeMessenger.js").TypedMessengerMessageSendData<ControlSocketResponseHandlers, import("../../serverManager/src/GameServer.js").ServerManagerResponseHandlers>} data
	 */
	async onMessage(data) {
		await this.#messenger.handleReceivedMessage(data);
	}
}
