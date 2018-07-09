"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_native_api_1 = require("node-firebird-native-api");
class Client {
    get client() {
        return this._client;
    }
    async create() {
        if (this._client) {
            throw new Error("Client already created");
        }
        const master = node_firebird_native_api_1.getMaster(node_firebird_native_api_1.getDefaultLibraryFilename());
        this._client = {
            master,
            dispatcher: (await master.getDispatcherAsync())
        };
    }
    async destroy() {
        if (!this._client) {
            throw new Error("Need created client");
        }
        this._client.dispatcher.releaseSync();
        if (process.platform !== "darwin") { // FIXME mac os
            node_firebird_native_api_1.disposeMaster(this._client.master);
        }
        this._client = undefined;
    }
    async statusAction(action) {
        const status = (await this.client.master.getStatusAsync());
        try {
            return await action(status);
        }
        finally {
            await status.disposeAsync();
        }
    }
    statusActionSync(action) {
        const status = this.client.master.getStatusSync();
        try {
            return action(status);
        }
        finally {
            status.disposeSync();
        }
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map