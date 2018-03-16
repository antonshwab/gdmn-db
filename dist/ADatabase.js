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
     * <pre><code>
     * const result = ADatabase.executeConnection(new XXDatabase(), {}, async (database) => {
     *      const transaction = await database.createTransaction();
     *      return await transaction.query("some sql");
     * })}
     * </code></pre>
     *
     * @param {DB} database
     * @param {Opt} options
     * @param {Executor<DB extends ADatabase<Opt, T>, R>} callback
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
     * <pre><code>
     * const result2 = ADatabase.executeTransaction(new XXDatabase(), {}, async (transaction) => {
     *      return await transaction.query("some sql");
     * })}
     * </code></pre>
     *
     * @param {DB} database
     * @param {Opt} options
     * @param {Executor<T extends ATransaction, R>} callback
     * @returns {Promise<R>}
     */
    static async executeTransaction(database, options, callback) {
        return await ADatabase.executeConnection(database, options, async (database) => {
            return await ATransaction_1.ATransaction.executeTransaction(await database.createTransaction(), callback);
        });
    }
}
exports.ADatabase = ADatabase;
//# sourceMappingURL=ADatabase.js.map