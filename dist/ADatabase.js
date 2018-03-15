"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const ATransaction_1 = __importDefault(require("./ATransaction"));
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
class DatabaseObj {
    /**
     * Example:
     * <pre><code>
     * const result = DatabaseObj.executeConnection(new XXDatabase(), {}, async (database) => {
     *      const transaction = await database.createTransaction();
     *      return await transaction.query("some sql");
     * })}
     * </code></pre>
     *
     * @param {DB} database
     * @param {Opt} options
     * @param {Executor<DB extends DatabaseObj<Opt, T>, R>} callback
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
     * const result2 = DatabaseObj.executeTransaction(new XXDatabase(), {}, async (transaction) => {
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
        return await DatabaseObj.executeConnection(database, options, async (database) => {
            return await ATransaction_1.default.executeTransaction(await database.createTransaction(), callback);
        });
    }
}
exports.default = DatabaseObj;
//# sourceMappingURL=ADatabase.js.map