"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADatabase_1 = require("./ADatabase");
class AConnectionPool {
    static async executeFromParent(sourceCallback, resultCallback) {
        let connectionPool;
        try {
            connectionPool = await sourceCallback(null);
            return await resultCallback(connectionPool);
        }
        finally {
            if (connectionPool) {
                await connectionPool.destroy();
            }
        }
    }
    /**
     * Example:
     * <pre>
     * const result = await AConnectionPool.executeConnectionPool(Factory.XXModule.newDefaultConnectionPool(),
     *      async (connectionPool) => {
     *          return await AConnectionPool.executeDatabase(connectionPool, async (database) => {
     *              return ...
     *          });
     *      })}
     * </pre>
     *
     * @param {TConnectionPool<Opt, DBOpt>} connectionPool
     * @param {DBOpt} dbOptions
     * @param {Opt} options
     * @param {TExecutor<TConnectionPool<Opt, DBOpt>, R>} callback
     * @returns {Promise<R>}
     */
    static async executeConnectionPool(connectionPool, dbOptions, options, callback) {
        return await AConnectionPool.executeFromParent(async () => {
            await connectionPool.create(dbOptions, options);
            return connectionPool;
        }, callback);
    }
    /**
     * Example:
     * <pre>
     * const result = await AConnectionPool.executeDatabase(connectionPool, async (database) => {
     *      return await ADatabase.executeTransaction(transaction, {}, async (transaction) => {
     *          return ...
     *      });
     * })}
     * </pre>
     *
     * @param {TConnectionPool<Opt, DBOpt>} connectionPool
     * @param {TExecutor<TDatabase<DBOpt>, R>} callback
     * @returns {Promise<R>}
     */
    static async executeDatabase(connectionPool, callback) {
        return await ADatabase_1.ADatabase.executeFromParent(() => connectionPool.get(), callback);
    }
}
exports.AConnectionPool = AConnectionPool;
//# sourceMappingURL=AConnectionPool.js.map