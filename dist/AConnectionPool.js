"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AConnection_1 = require("./AConnection");
class AConnectionPool {
    static async executeSelf(selfReceiver, callback) {
        let self;
        try {
            self = await selfReceiver(null);
            return await callback(self);
        }
        finally {
            if (self) {
                await self.destroy();
            }
        }
    }
    static async executeConnectionPool({ connectionPool, callback, connectionOptions, options }) {
        return await AConnectionPool.executeSelf(async () => {
            await connectionPool.create(connectionOptions, options);
            return connectionPool;
        }, callback);
    }
    static async executeConnection({ connectionPool, callback }) {
        return await AConnection_1.AConnection.executeSelf(() => connectionPool.get(), callback);
    }
}
exports.AConnectionPool = AConnectionPool;
//# sourceMappingURL=AConnectionPool.js.map