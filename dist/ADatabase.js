"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ATransaction_1 = require("./ATransaction");
/**
 * Example:
 * <pre><code>
 * (async () => {
 *      const database = new XXDatabase();
 *      try {
 *          const transaction = await database.createTransaction();
 *          try {
 *              await transaction.start();
 *
 *              await transaction.query("some sql");
 *
 *              await transaction.commit();
 *          } catch (error) {
 *              try {
 *                  await transaction.rollback();
 *              } catch (error) {
 *                  console.warn(error);
 *              }
 *              throw error;
 *          }
 *      } finally {
 *          try {
 *              await database.disconnect();
 *          } catch (err) {
 *              console.warn(err);
 *          }
 *      }
 * })()
 * </code></pre>
 */
class ADatabase {
    /**
     * Example:
     * <pre>
     * const result = ADatabase.executeConnection(new XXDatabase(), {}, async (source) => {
     *      const transaction = await source.createTransaction();
     *      return await transaction.query("some sql");
     * })}
     * </pre>
     *
     * @param {TDatabase<Opt>} database
     * @param {Opt} options
     * @param {TExecutor<TDatabase<Opt>, R>} callback
     * @returns {Promise<R>}
     */
    static async executeConnection(database, options, callback) {
        try {
            await database.connect(options);
            return await callback(database);
        }
        finally {
            try {
                await database.disconnect();
            }
            catch (error) {
                console.warn(error);
            }
        }
    }
    /**
     * Example:
     * <pre>
     * const result = ADatabase.executeTransaction(new XXDatabase(), {}, async (transaction) => {
     *      return await transaction.query("some sql");
     * })}
     * </pre>
     *
     * @param {TDatabase<Opt>} database
     * @param {Opt} options
     * @param {TExecutor<TTransaction, R>} callback
     * @returns {Promise<R>}
     */
    static async executeTransaction(database, options, callback) {
        return await ADatabase.executeConnection(database, options, async (database) => {
            return await ATransaction_1.ATransaction.executeTransaction(await database.createTransaction(), callback);
        });
    }
    /**
     * Example:
     * <pre>
     * const connectionPool = new XXConnectionPool();
     * connectionPool.create({});
     *
     * const result = ADatabase.executeConnectionPool(connectionPool, async (source) => {
     *      const transaction = await source.createTransaction();
     *      return await transaction.query("some sql");
     * })}
     *
     * connectionPool.destroy();
     * </pre>
     *
     * @param {TConnectionPool<Opt, DBOptions>} connectionPool
     * @param {TExecutor<TDatabase<DBOptions>, R>} callback
     * @returns {Promise<R>}
     */
    static async executeConnectionPool(connectionPool, callback) {
        let database;
        try {
            database = await connectionPool.get();
            return await callback(database);
        }
        finally {
            try {
                if (database) {
                    await database.disconnect();
                }
            }
            catch (error) {
                console.warn(error);
            }
        }
    }
    /**
     * Example:
     * <pre>
     * const connectionPool = new XXConnectionPool();
     * connectionPool.create({});
     *
     * const result = ADatabase.executeTransactionPool(connectionPool, async (transaction) => {
     *      return await transaction.query("some sql");
     * })}
     *
     * connectionPool.destroy();
     * </pre>
     *
     * @param {TConnectionPool<Opt, DBOptions>} connectionPool
     * @param {TExecutor<TTransaction, R>} callback
     * @returns {Promise<R>}
     */
    static async executeTransactionPool(connectionPool, callback) {
        return await ADatabase.executeConnectionPool(connectionPool, async (database) => {
            return await ATransaction_1.ATransaction.executeTransaction(await database.createTransaction(), callback);
        });
    }
}
exports.ADatabase = ADatabase;
//# sourceMappingURL=ADatabase.js.map