"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_native_api_1 = require("node-firebird-native-api");
class Context {
    get client() {
        return this._client;
    }
    create() {
        if (this._client) {
            throw new Error("Context already created");
        }
        const master = node_firebird_native_api_1.getMaster(node_firebird_native_api_1.getDefaultLibraryFilename());
        this._client = {
            master,
            dispatcher: master.getDispatcherSync(),
            util: master.getUtilInterfaceSync()
        };
    }
    destroy() {
        if (!this._client) {
            throw new Error("Need created context");
        }
        this.statusActionSync((status) => this._client.dispatcher.shutdownSync(status, 0, -3));
        this._client.dispatcher.releaseSync();
        node_firebird_native_api_1.disposeMaster(this._client.master);
    }
    async statusAction(action) {
        const status = this.client.master.getStatusSync();
        try {
            return await action(status);
        }
        finally {
            status.disposeSync();
        }
    }
    statusActionSync(action) {
        const status = this._client.master.getStatusSync();
        try {
            return action(status);
        }
        finally {
            status.disposeSync();
        }
    }
}
exports.Context = Context;
//# sourceMappingURL=Context.js.map