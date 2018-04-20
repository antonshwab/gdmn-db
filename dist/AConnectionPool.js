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
    /**
     * Example:
     * <pre>
     * const result = await AConnectionPool.executeConnectionPool(Factory.XXModule.newDefaultConnectionPool(),
     *      async (connectionPool) => {
     *          return await AConnectionPool.executeConnection(connectionPool, async (connection) => {
     *              return ...
     *          });
     *      })}
     * </pre>
     */
    static async executeConnectionPool(connectionPool, connectionOptions, options, callback) {
        return await AConnectionPool.executeSelf(async () => {
            await connectionPool.create(connectionOptions, options);
            return connectionPool;
        }, callback);
    }
    /**
     * Example:
     * <pre>
     * const result = await AConnectionPool.executeConnection(connectionPool, async (connection) => {
     *      return await AConnection.executeTransaction(transaction, {}, async (transaction) => {
     *          return ...
     *      });
     * })}
     * </pre>
     */
    static async executeConnection(connectionPool, callback) {
        return await AConnection_1.AConnection.executeSelf(() => connectionPool.get(), callback);
    }
}
exports.AConnectionPool = AConnectionPool;
//# sourceMappingURL=AConnectionPool.js.map